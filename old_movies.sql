CREATE DATABASE IF NOT EXISTS movie_db;

USE movie_db;

DROP TABLE IF EXISTS reviews;

DROP TABLE IF EXISTS movies;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) DEFAULT COLLATE = utf8mb4_unicode_ci;

CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_year INT NOT NULL,
    genre VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) DEFAULT COLLATE = utf8mb4_unicode_ci;

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating INT NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_movie FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
    CONSTRAINT uq_user_movie UNIQUE (user_id, movie_id)
) DEFAULT COLLATE = utf8mb4_unicode_ci;

INSERT INTO
    users (username, email)
VALUES (
        'alice_jones',
        'alice@example.com'
    ),
    (
        'bob_smith',
        'bob@example.com'
    ),
    (
        'charlie_brown',
        'charlie@example.com'
    ),
    (
        'dana_white',
        'dana@example.com'
    ),
    (
        'evan_wright',
        'evan@example.com'
    ),
    (
        'fiona_gallagher',
        'fiona@example.com'
    ),
    (
        'george_cloney',
        'george@example.com'
    ),
    (
        'hannah_b',
        'hannah@example.com'
    ),
    (
        'ian_malcolm',
        'ian@example.com'
    ),
    (
        'julia_roberts',
        'julia@example.com'
    ),
    (
        'kevin_bacon',
        'kevin@example.com'
    ),
    (
        'lana_del',
        'lana@example.com'
    ),
    (
        'marcus_aurelius',
        'marcus@example.com'
    ),
    (
        'nina_simone',
        'nina@example.com'
    ),
    (
        'oscar_wilde',
        'oscar@example.com'
    ),
    (
        'penelope_c',
        'penelope@example.com'
    ),
    (
        'quentin_t',
        'quentin@example.com'
    ),
    (
        'rachel_green',
        'rachel@example.com'
    ),
    (
        'sam_wilson',
        'sam@example.com'
    ),
    (
        'tina_turner',
        'tina@example.com'
    );

INSERT INTO
    movies (title, release_year, genre)
VALUES (
        'The Shawshank Redemption',
        1994,
        'Drama'
    ),
    (
        'The Godfather',
        1972,
        'Crime'
    ),
    (
        'The Dark Knight',
        2008,
        'Action'
    ),
    (
        'The Godfather Part II',
        1974,
        'Crime'
    ),
    ('12 Angry Men', 1957, 'Drama'),
    (
        'Schindler''s List',
        1993,
        'Biography'
    ),
    (
        'The Lord of the Rings: The Return of the King',
        2003,
        'Fantasy'
    ),
    ('Pulp Fiction', 1994, 'Crime'),
    (
        'The Lord of the Rings: The Fellowship of the Ring',
        2001,
        'Fantasy'
    ),
    (
        'Il Buono, Il Brutto, Il Cattivo',
        1966,
        'Western'
    ),
    ('Fight Club', 1999, 'Drama'),
    ('Forrest Gump', 1994, 'Drama'),
    ('Inception', 2010, 'Sci-Fi'),
    (
        'The Lord of the Rings: The Two Towers',
        2002,
        'Fantasy'
    ),
    (
        'Star Wars: Episode V - The Empire Strikes Back',
        1980,
        'Sci-Fi'
    ),
    ('The Matrix', 1999, 'Sci-Fi'),
    (
        'GoodFellas',
        1990,
        'Biography'
    ),
    (
        'One Flew Over the Cuckoo''s Nest',
        1975,
        'Drama'
    ),
    (
        'Seven Samurai',
        1954,
        'Action'
    ),
    ('Se7en', 1995, 'Crime'),
    (
        'The Silence of the Lambs',
        1991,
        'Thriller'
    ),
    ('City of God', 2002, 'Crime'),
    (
        'It''s a Wonderful Life',
        1946,
        'Drama'
    ),
    (
        'Life Is Beautiful',
        1997,
        'Comedy'
    ),
    (
        'Star Wars: Episode IV - A New Hope',
        1977,
        'Sci-Fi'
    ),
    (
        'Saving Private Ryan',
        1998,
        'Drama'
    ),
    (
        'Spirited Away',
        2001,
        'Animation'
    ),
    (
        'The Green Mile',
        1999,
        'Crime'
    ),
    (
        'Interstellar',
        2014,
        'Sci-Fi'
    ),
    ('Parasite', 2019, 'Thriller'),
    (
        'Léon: The Professional',
        1994,
        'Action'
    ),
    (
        'The Usual Suspects',
        1995,
        'Mystery'
    ),
    (
        'The Lion King',
        1994,
        'Animation'
    ),
    (
        'The Pianist',
        2002,
        'Biography'
    ),
    (
        'Terminator 2: Judgment Day',
        1991,
        'Action'
    ),
    (
        'Back to the Future',
        1985,
        'Adventure'
    ),
    (
        'American History X',
        1998,
        'Drama'
    ),
    (
        'Modern Times',
        1936,
        'Comedy'
    ),
    ('Gladiator', 2000, 'Action'),
    ('Psycho', 1960, 'Horror'),
    ('The Departed', 2006, 'Crime'),
    ('City Lights', 1931, 'Comedy'),
    ('Whiplash', 2014, 'Drama'),
    (
        'The Prestige',
        2006,
        'Mystery'
    ),
    (
        'The Intouchables',
        2011,
        'Biography'
    ),
    ('Casablanca', 1942, 'Romance'),
    (
        'Once Upon a Time in the West',
        1968,
        'Western'
    ),
    (
        'Rear Window',
        1954,
        'Mystery'
    ),
    ('Alien', 1979, 'Sci-Fi'),
    (
        'Cinema Paradiso',
        1988,
        'Drama'
    );

INSERT INTO
    reviews (
        user_id,
        movie_id,
        rating,
        comment
    )
VALUES (
        1,
        10,
        5,
        'Honestly, this is one of the greatest cinematic achievements I have ever witnessed. The cinematography utilizes natural lighting in a way that makes every single frame look like a Renaissance painting.\n\nThe pacing is deliberate but completely necessary to establish the atmospheric dread. The lead actor gives a career-defining performance that will undoubtedly sweep awards season. My only minor critique is that the second act drags slightly, but the explosive finale more than makes up for it. An absolute must-watch on the biggest screen possible!'
    ),
    (
        2,
        14,
        4,
        'A incredibly strong entry into the director''s filmography, though it doesn''t quite reach the heights of their earlier work from the late 90s.\n\nWhat works beautifully here is the sound design and the haunting orchestral score—it keeps you on the edge of your seat even during standard conversational scenes. However, the script leans a bit too heavily on exposition in the middle section, treating the audience like they can''t follow the structural mystery. Still, the chemistry between the two leads carries the emotional weight effortlessly. Solid 4 out of 5.'
    ),
    (
        3,
        25,
        2,
        'I am genuinely baffled by the rave reviews this is getting across social media. The concept in the trailer looked incredibly promising, but the execution is completely messy.\n\nThe film suffers from a massive identity crisis—it can''t decide if it wants to be a psychological thriller, a sci-fi mystery, or a family drama, failing to achieve any of them cleanly. Characters make completely irrational decisions just to push the plot forward, and the dialogue feels like it was generated by an AI trying to sound profound. Two stars solely for the impressive visual effects in the opening sequence.'
    ),
    (
        4,
        5,
        5,
        'Masterful storytelling from beginning to end. It is rare to see a movie that runs over two and a half hours maintain such a tight, vice-grip hold on the audience''s attention span.\n\nThe editing is razor-sharp, cutting between the parallel timelines seamlessly without ever causing confusion. The thematic exploration of grief and generational trauma is handled with incredible nuance and maturity, avoiding cheap Hollywood melodrama. I found myself tearing up in the final ten minutes. Do not sleep on this masterpiece.'
    ),
    (
        5,
        18,
        1,
        'This was an absolute chore to get through. I came in with incredibly high expectations given the star-studded cast, but it turned out to be a massive waste of talent and production budget.\n\nThe script is filled with utterly insufferable, unlikable characters that you actively root against, and the humor falls completely flat in every scene. To make matters worse, the lighting is so aggressively dim and muddy that I could barely tell what was happening during the third-act action sequences. Avoid this at all costs—save your time and money.'
    ),
    (
        6,
        32,
        4,
        'A very pleasant surprise! I went into the theater expecting a standard, predictable summer blockbuster, but what I got was a clever, subverted take on the entire genre.\n\nThe writing is exceptionally witty, packed with meta-commentary that keeps the narrative feeling fresh and self-aware. The practical effects look leagues better than the lazy CGI we usually see these days. It loses a little bit of steam during the generic villain showdown at the end, but the journey getting there is an absolute blast.'
    ),
    (
        7,
        45,
        5,
        'Some movies are meant to be watched, while others are meant to be experienced. This falls squarely into the latter category.\n\nThe director crafts a mesmerizing, hypnotic atmosphere that pulls you directly into the environment. The subtextual layers regarding societal decay and isolation are brilliant, requiring a second viewing to fully unpack everything. The performance by the lead actress is nothing short of mesmerizing—she commands the screen without saying a word. A triumph of modern filmmaking.'
    ),
    (
        8,
        8,
        3,
        'An incredibly average film that is completely elevated by its phenomenal third act. For the first hour and a half, I was checking my watch constantly due to the agonizingly slow pacing and redundant subplots that went nowhere.\n\nBut once the major twist happens, the film kicks into overdrive and delivers a spectacular, mind-bending conclusion. If you have the patience to sit through a tedious setup, the payoff is genuinely rewarding. Otherwise, wait until it streams and watch it on 1.5x speed.'
    ),
    (
        9,
        21,
        5,
        'Absolute perfection. From the very first tracking shot to the final haunting close-up, the direction is utterly flawless.\n\nThe script is incredibly tight, with every single line of dialogue serving a dual purpose for character development and plot progression. The production design perfectly captures the gritty, historical era, making the setting feel like its own living character. It''s rare to see a movie hit every single target it aims for so precisely. This is instantly going into my top ten favorite films of all time.'
    ),
    (
        10,
        15,
        2,
        'A classic case of style over substance. There is no denying that the cinematography and neon color palettes are absolutely stunning to look at—every frame looks like a high-fashion music video.\n\nUnfortunately, there is almost zero plot holding those pretty pictures together. The characters are completely hollow archetypes with no clear motivations, and the central mystery wraps up with an incredibly lazy, unearned deus ex machina. It''s an enjoyable visual showcase, but a total failure as a narrative piece.'
    ),
    (
        11,
        40,
        4,
        'This film does a fantastic job handling a very sensitive historical event without feeling exploitative or overly sanitized.\n\nThe performances across the board are deeply grounded, capturing the raw human emotion of the situation beautifully. The director shows incredible restraint by focusing on the quiet, intimate moments rather than relying on massive, sensationalized set pieces. My only critique is that the ending felt slightly abrupt, leaving a few minor character arcs unresolved. Highly recommended.'
    ),
    (
        12,
        13,
        1,
        'I want my two hours back. This movie is an incoherent, bloated disaster that feels like it was pieced together by a committee of studio executives looking at a trend spreadsheet.\n\nThe pacing is completely erratic, jumping violently between slapstick comedy and dark, gritty violence without any tonal connective tissue. The soundtrack is incredibly distracting, blasting pop songs over dramatic scenes where they completely ruin the emotional gravity. A total mess from start to finish.'
    ),
    (
        13,
        27,
        4,
        'An exceptionally well-made thriller that manages to keep the tension high despite taking place almost entirely in a single room.\n\nThe script is a masterclass in escalating stakes, revealing just enough information at key intervals to keep the audience guessing who is telling the truth. The tight, claustrophobic camera angles amplify the feeling of paranoia beautifully. It stumbles slightly with a predictable final twist, but the incredible acting performances make it well worth watching.'
    ),
    (
        14,
        9,
        5,
        'Wow. I am completely speechless. I walked into this movie completely blind and walked out feeling emotionally overwhelmed in the best way possible.\n\nThe story is devastatingly beautiful, capturing the complexities of human relationships with heartbreaking honesty. The musical score is hauntingly beautiful, lingering in your head long after the credits roll. It is a rare, poetic piece of cinema that demands your full attention and rewards you with an unforgettable experience. A true work of art.'
    ),
    (
        15,
        33,
        3,
        'A perfectly fine movie that doesn''t take any risks. The acting is decent, the directing is competent, and the story beats happen exactly when you expect them to based on standard three-act structure.\n\nIt''s the ultimate "background noise" film—enjoyable while you are watching it, but completely forgettable the moment you leave the theater. If you are looking for an easy, entertaining watch that won''t challenge your brain at all, this fits the bill perfectly.'
    ),
    (
        16,
        50,
        5,
        'An absolute triumph. This is how you close out a trilogy! The stakes feel genuinely real, the character arcs that have been building for years get deeply satisfying payoffs, and the emotional resonance is massive.\n\nThe action sequences are beautifully choreographed and easy to follow, a massive relief from the shaky-cam trends dominating modern cinema. It is an incredibly satisfying conclusion that honors the characters and the fans perfectly.'
    ),
    (
        17,
        3,
        4,
        'A beautifully shot, deeply melancholic look at modern isolation. The director uses architecture and wide framing to emphasize how lonely the characters are despite living in a dense, bustling metropolis.\n\nThe performances are quiet and understated, relying heavily on subtle facial expressions rather than grand monologues. It''s a slow burn that requires some patience, but if you sink into its moody rhythm, it is an incredibly rewarding and empathetic piece of work.'
    ),
    (
        18,
        12,
        2,
        'A massive disappointment. The original film is an undisputed classic, but this legacy sequel feels like a cynical, uninspired cash grab designed to capitalize on nostalgia.\n\nIt rehashes the exact same plot points as the original but executes them with half the charm and double the unnecessary CGI. New characters are introduced but given absolutely zero development, existing solely to set up potential spin-offs. Do yourself a favor and just rewatch the original instead.'
    ),
    (
        19,
        42,
        5,
        'Brilliant, sharp, and relentlessly funny. This is the best satirical comedy I have seen in a decade. The script takes aim at modern tech culture and slices through the hypocrisy with surgical precision.\n\nThe comedic timing of the ensemble cast is flawless, with background gags and rapid-fire dialogue that require multiple viewings to catch everything. Beneath the laugh-out-loud comedy is a genuinely terrifying and accurate critique of our current societal trajectory. Phenomenal work!'
    ),
    (
        20,
        1,
        4,
        'A very strong biographical drama that avoids the standard "cradle-to-grave" biopic traps by focusing heavily on one crucial week in the subject''s life.\n\nThis narrow focus allows for incredible character depth and intense psychological exploration. The lead actor is unrecognizable, disappearing into the role completely. The historical production design is immaculate, making you feel like a fly on the wall in those smoke-filled rooms. A bit dry in the middle, but thoroughly engaging overall.'
    );