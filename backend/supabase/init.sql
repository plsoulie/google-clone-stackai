-- Create search_results table to store search queries and results
CREATE TABLE IF NOT EXISTS search_results (
    id UUID PRIMARY KEY,
    query TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    organic_results JSONB NOT NULL,
    knowledge_graph JSONB,
    local_results JSONB,
    related_questions JSONB,
    related_searches JSONB,
    inline_images JSONB,
    answer_box JSONB,
    ai_response TEXT,
    location TEXT
);

-- Create index on query field for faster lookups
CREATE INDEX IF NOT EXISTS search_results_query_idx ON search_results(query);

-- Create RLS policies for security
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;

-- Create public policies (since we're not using auth in this app)
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

-- Create ai_responses table to track AI responses separately
CREATE TABLE IF NOT EXISTS ai_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_id UUID NOT NULL REFERENCES search_results(id) ON DELETE CASCADE,
    response TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on search_id for faster lookups
CREATE INDEX IF NOT EXISTS ai_responses_search_id_idx ON ai_responses(search_id);

-- Create RLS policies for security
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

-- Create public policies (since we're not using auth in this app)
CREATE POLICY "Public can read ai_responses"
    ON ai_responses
    FOR SELECT
    USING (true);

CREATE POLICY "Public can insert ai_responses"
    ON ai_responses
    FOR INSERT
    WITH CHECK (true);

-- Authenticated policies (commented out since we're not using auth)
/*
CREATE POLICY "Authenticated users can read search_results"
    ON search_results
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert search_results"
    ON search_results
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read ai_responses"
    ON ai_responses
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert ai_responses"
    ON ai_responses
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
*/ 