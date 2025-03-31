-- This script migrates data from the old search_records table to the new search_results table
-- It should be run if you already have data in search_records that you want to preserve

-- Check if the old table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'search_records') THEN
        -- Create the new table if it doesn't exist
        CREATE TABLE IF NOT EXISTS search_results (
            id UUID PRIMARY KEY,
            query TEXT NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            organic_results JSONB DEFAULT '[]'::jsonb,
            knowledge_graph JSONB,
            local_results JSONB,
            related_questions JSONB,
            related_searches JSONB,
            inline_images JSONB,
            answer_box JSONB,
            ai_response TEXT,
            location TEXT
        );

        -- Copy data from the old table to the new table with transformations
        INSERT INTO search_results (
            id, 
            query, 
            timestamp, 
            organic_results, 
            knowledge_graph, 
            local_results, 
            related_questions, 
            related_searches, 
            inline_images, 
            answer_box, 
            ai_response, 
            location
        )
        SELECT 
            id, 
            query, 
            timestamp, 
            COALESCE((results->'organic_results')::jsonb, '[]'::jsonb),
            (results->'knowledge_graph')::jsonb,
            (results->'local_results')::jsonb,
            (results->'related_questions')::jsonb,
            (results->'related_searches')::jsonb,
            (results->'inline_images')::jsonb,
            (results->'answer_box')::jsonb,
            ai_response, 
            location
        FROM 
            search_records
        WHERE 
            NOT EXISTS (
                SELECT 1 FROM search_results 
                WHERE search_results.id = search_records.id
            );

        -- Update ai_responses table to point to the new table
        ALTER TABLE ai_responses 
        DROP CONSTRAINT IF EXISTS ai_responses_search_id_fkey;
        
        ALTER TABLE ai_responses
        ADD CONSTRAINT ai_responses_search_id_fkey
        FOREIGN KEY (search_id)
        REFERENCES search_results(id)
        ON DELETE CASCADE;

        -- Create indexes and RLS policies for the new table
        CREATE INDEX IF NOT EXISTS search_results_query_idx ON search_results(query);
        ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Public can read search_results"
            ON search_results
            FOR SELECT
            USING (true);

        CREATE POLICY "Public can insert search_results"
            ON search_results
            FOR INSERT
            WITH CHECK (true);

        CREATE POLICY "Public can update search_results"
            ON search_results
            FOR UPDATE
            USING (true);

        -- Optionally, rename the old table to backup
        ALTER TABLE search_records RENAME TO search_records_backup;
        
        RAISE NOTICE 'Migration from search_records to search_results completed successfully.';
    ELSE
        RAISE NOTICE 'No migration needed. search_records table does not exist.';
    END IF;
END $$; 