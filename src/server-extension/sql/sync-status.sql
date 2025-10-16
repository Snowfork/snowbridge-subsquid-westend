CREATE OR REPLACE FUNCTION get_sync_status(table_name TEXT)
RETURNS INT AS $$
DECLARE
  result INT;
BEGIN
  -- Construct the query string.
  -- The `format()` function is used to safely inject the table name,
  -- using `%I` for an SQL identifier (which handles quoting).
  EXECUTE format('SELECT height FROM %I.status', table_name)
  INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
