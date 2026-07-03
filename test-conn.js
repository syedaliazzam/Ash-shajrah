const { parse } = require("pg-connection-string");
const url = "postgresql://postgres.yzxoonmpunvbcdtyovqx:Admission.ashshajrah@124@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
console.log(parse(url));
