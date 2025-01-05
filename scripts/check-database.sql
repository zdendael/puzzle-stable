-- Kontrola existence všech potřebných tabulek
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'puzzles'
) as puzzles_exists,
EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'manufacturers'
) as manufacturers_exists,
EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tags'
) as tags_exists,
EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'categories'
) as categories_exists,
EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sources'
) as sources_exists,
EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'puzzle_sessions'
) as sessions_exists,
EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'wishlist'
) as wishlist_exists;

-- Kontrola struktury tabulky sources
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'sources'
ORDER BY ordinal_position;

-- Kontrola struktury tabulky puzzles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'puzzles'
ORDER BY ordinal_position;

-- Kontrola vazebních tabulek
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'puzzle_tags'
) as puzzle_tags_exists,
EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'puzzle_categories'
) as puzzle_categories_exists;

-- Kontrola omezení a cizích klíčů
SELECT tc.constraint_name, tc.constraint_type, 
       kcu.column_name, 
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('puzzles', 'sources', 'puzzle_sessions', 'wishlist')
ORDER BY tc.table_name, tc.constraint_name;