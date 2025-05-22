-- Grant permissions to COURSE_DB_USERNAME on all tables in course_service_s4e
DO
$$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON TABLE public.' || quote_ident(r.tablename) || ' TO "' || current_user || '";';
    END LOOP;
END
$$;

-- Optionally, grant usage on sequences
DO
$$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON SEQUENCE public.' || quote_ident(r.sequence_name) || ' TO "' || current_user || '";';
    END LOOP;
END
$$;
