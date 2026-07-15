-- Revert dedicated question columns back to responses JSONB.
-- Run after backup. Safe to re-run: skips rows that already have responses.
--
-- Verify first:
-- SELECT COUNT(*) AS total_rows,
--        COUNT(*) FILTER (WHERE status = 'submitted') AS submitted_rows,
--        COUNT(*) FILTER (WHERE responses IS NOT NULL) AS rows_with_json_responses
-- FROM parent_interview_forms;

ALTER TABLE public.parent_interview_forms
  ADD COLUMN IF NOT EXISTS responses JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'parent_interview_forms'
      AND column_name = 'form_version'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE public.parent_interview_forms
      ADD COLUMN IF NOT EXISTS form_version INTEGER NOT NULL DEFAULT 2;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public._pi_bool_to_yes_no(val BOOLEAN)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE val WHEN true THEN 'yes' WHEN false THEN 'no' ELSE NULL END;
$$;

CREATE OR REPLACE FUNCTION public._pi_yes_no_details(
  answer BOOLEAN,
  details TEXT
)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT jsonb_build_object(
    'answer',
    CASE answer WHEN true THEN 'yes' WHEN false THEN 'no' ELSE NULL END,
    'details',
    CASE
      WHEN answer = true THEN COALESCE(NULLIF(BTRIM(details), ''), '')
      WHEN answer = false THEN ''
      ELSE NULL
    END
  );
$$;

CREATE OR REPLACE FUNCTION public._pi_yes_no_only(answer BOOLEAN)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT jsonb_build_object(
    'answer',
    CASE answer WHEN true THEN 'yes' WHEN false THEN 'no' ELSE NULL END
  );
$$;

CREATE OR REPLACE FUNCTION public._pi_health_rating(
  rating TEXT,
  details TEXT
)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT jsonb_build_object(
    'rating',
    rating,
    'details',
    CASE
      WHEN rating IN ('fair', 'poor') THEN COALESCE(NULLIF(BTRIM(details), ''), '')
      ELSE ''
    END
  );
$$;

CREATE OR REPLACE FUNCTION public._pi_format_bedtime(val TIME)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN val IS NULL THEN NULL
    ELSE TO_CHAR(val, 'FMHH12:MI AM')
  END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'parent_interview_forms'
      AND column_name = 'q1_birth_order'
  ) THEN
    UPDATE public.parent_interview_forms p
    SET
      form_version = 2,
      responses = jsonb_build_object(
        'formVersion', 2,
        'answers', jsonb_strip_nulls(jsonb_build_object(
          'q1', p.q1_birth_order,
          'q2', public._pi_yes_no_details(p.q2_birth_complications, p.q2_birth_complications_details),
          'q3', public._pi_health_rating(p.q3_overall_health, p.q3_health_concerns_details),
          'q4', public._pi_yes_no_details(p.q4_medical_condition, p.q4_medical_condition_details),
          'q5', public._pi_yes_no_details(p.q5_current_medication, p.q5_current_medication_details),
          'q6', public._pi_yes_no_details(p.q6_vision_hearing_concern, p.q6_vision_hearing_details),
          'q7', public._pi_yes_no_details(p.q7_medical_psychological_assessment, p.q7_assessment_details),
          'q8', jsonb_build_object(
            'sat', p.q8_sat_independently_age,
            'crawled', p.q8_crawled_age,
            'walked', p.q8_started_walking_age
          ),
          'q9', p.q9_first_word_age,
          'q10', p.q10_sentences_age,
          'q11', p.q11_home_languages,
          'q12', public._pi_yes_no_only(p.q12_communicates_needs),
          'q13', public._pi_yes_no_only(p.q13_holds_pencil_crayon),
          'q14', public._pi_yes_no_only(p.q14_recognises_colours_shapes_letters_numbers),
          'q15', public._pi_yes_no_only(p.q15_follows_simple_instructions),
          'q16', public._pi_yes_no_only(p.q16_focuses_five_to_ten_minutes),
          'q17', public._pi_yes_no_details(p.q17_attended_school_daycare, p.q17_school_daycare_details),
          'q18', public._pi_yes_no_only(p.q18_interacts_with_children),
          'q19', public._pi_yes_no_details(p.q19_separation_anxiety, p.q19_separation_anxiety_details),
          'q20_1', public._pi_yes_no_only(p.q20_1_bedwetting),
          'q20_2', public._pi_yes_no_details(p.q20_2_unusual_fears, p.q20_2_unusual_fears_details),
          'q20_3', public._pi_yes_no_details(p.q20_3_frequent_anger_stubbornness, p.q20_3_anger_stubbornness_details),
          'q20_4', public._pi_yes_no_details(p.q20_4_anxiety_mood_changes, p.q20_4_anxiety_mood_details),
          'q21', p.q21_response_to_correction,
          'q22', p.q22_home_behaviour_management,
          'q23', public._pi_yes_no_only(p.q24_regular_outdoor_play),
          'q24', public._pi_yes_no_only(p.q25_rides_bicycle_tricycle),
          'q25', public._pi_format_bedtime(p.q26_usual_bedtime),
          'q26', public._pi_yes_no_only(p.q27_afternoon_nap),
          'q27', p.q28_favourite_activities_toys,
          'q28', jsonb_build_object(
            'duration', p.q29_screen_time_duration,
            'supervised', p.q29_screen_time_supervised
          ),
          'q29', p.q30_parent_expectations
        ))
      ),
      updated_at = NOW()
    WHERE p.responses IS NULL
      AND p.status = 'submitted'
      AND (
        p.q1_birth_order IS NOT NULL
        OR p.q2_birth_complications IS NOT NULL
        OR p.q30_parent_expectations IS NOT NULL
      );
  END IF;
END $$;

DO $$
DECLARE
  col TEXT;
  legacy_cols TEXT[] := ARRAY[
    'q1_birth_order',
    'q2_birth_complications',
    'q2_birth_complications_details',
    'q3_overall_health',
    'q3_health_concerns_details',
    'q4_medical_condition',
    'q4_medical_condition_details',
    'q5_current_medication',
    'q5_current_medication_details',
    'q6_vision_hearing_concern',
    'q6_vision_hearing_details',
    'q7_medical_psychological_assessment',
    'q7_assessment_details',
    'q8_sat_independently_age',
    'q8_crawled_age',
    'q8_started_walking_age',
    'q9_first_word_age',
    'q10_sentences_age',
    'q11_home_languages',
    'q12_communicates_needs',
    'q13_holds_pencil_crayon',
    'q14_recognises_colours_shapes_letters_numbers',
    'q15_follows_simple_instructions',
    'q16_focuses_five_to_ten_minutes',
    'q17_attended_school_daycare',
    'q17_school_daycare_details',
    'q18_interacts_with_children',
    'q19_separation_anxiety',
    'q19_separation_anxiety_details',
    'q20_1_bedwetting',
    'q20_2_unusual_fears',
    'q20_2_unusual_fears_details',
    'q20_3_frequent_anger_stubbornness',
    'q20_3_anger_stubbornness_details',
    'q20_4_anxiety_mood_changes',
    'q20_4_anxiety_mood_details',
    'q21_response_to_correction',
    'q22_home_behaviour_management',
    'q23_toilet_trained',
    'q23_regular_outdoor_play',
    'q24_regular_outdoor_play',
    'q24_rides_bicycle_tricycle',
    'q25_rides_bicycle_tricycle',
    'q25_usual_bedtime',
    'q26_usual_bedtime',
    'q26_afternoon_nap',
    'q27_afternoon_nap',
    'q27_favourite_activities_toys',
    'q28_favourite_activities_toys',
    'q28_screen_time_duration',
    'q28_screen_time_supervised',
    'q29_screen_time_duration',
    'q29_screen_time_supervised',
    'q29_parent_expectations',
    'q30_parent_expectations'
  ];
BEGIN
  FOREACH col IN ARRAY legacy_cols
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'parent_interview_forms'
        AND column_name = col
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.parent_interview_forms DROP COLUMN %I',
        col
      );
    END IF;
  END LOOP;
END $$;

-- Drop legacy TEXT form_version if an INTEGER column was added separately.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'parent_interview_forms'
      AND column_name = 'form_version'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE public.parent_interview_forms DROP COLUMN form_version;
    ALTER TABLE public.parent_interview_forms
      ADD COLUMN IF NOT EXISTS form_version INTEGER NOT NULL DEFAULT 2;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public._pi_bool_to_yes_no(BOOLEAN);
DROP FUNCTION IF EXISTS public._pi_yes_no_details(BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS public._pi_yes_no_only(BOOLEAN);
DROP FUNCTION IF EXISTS public._pi_health_rating(TEXT, TEXT);
DROP FUNCTION IF EXISTS public._pi_format_bedtime(TIME);
