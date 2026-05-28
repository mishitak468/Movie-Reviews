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
    poster_url VARCHAR(500) NULL,
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

INSERT INTO users (username, email) VALUES
    ('alice_jones', 'alice@example.com'),
    ('bob_smith', 'bob@example.com'),
    ('charlie_brown', 'charlie@example.com'),
    ('dana_white', 'dana@example.com'),
    ('evan_wright', 'evan@example.com'),
    ('fiona_gallagher', 'fiona@example.com'),
    ('george_cloney', 'george@example.com'),
    ('hannah_b', 'hannah@example.com'),
    ('ian_malcolm', 'ian@example.com'),
    ('julia_roberts', 'julia@example.com'),
    ('kevin_bacon', 'kevin@example.com'),
    ('lana_del', 'lana@example.com'),
    ('marcus_aurelius', 'marcus@example.com'),
    ('nina_simone', 'nina@example.com'),
    ('oscar_wilde', 'oscar@example.com'),
    ('penelope_c', 'penelope@example.com'),
    ('quentin_t', 'quentin@example.com'),
    ('rachel_green', 'rachel@example.com'),
    ('sam_wilson', 'sam@example.com'),
    ('tina_turner', 'tina@example.com');

INSERT INTO movies (title, release_year, genre, poster_url) VALUES
    ('The Shawshank Redemption', 1994, 'Drama', 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg'),
    ('The Godfather', 1972, 'Crime', 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg'),
    ('The Dark Knight', 2008, 'Action', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'),
    ('The Godfather Part II', 1974, 'Crime', 'https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg'),
    ('12 Angry Men', 1957, 'Drama', 'https://image.tmdb.org/t/p/w500/zhG3vKWyDRaZYoaww1UVAi29T9h.jpg'),
    ('Schindler''s List', 1993, 'Biography', 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg'),
    ('The Lord of the Rings: The Return of the King', 2003, 'Fantasy', 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg'),
    ('Pulp Fiction', 1994, 'Crime', 'https://image.tmdb.org/t/p/w500/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg'),
    ('The Lord of the Rings: The Fellowship of the Ring', 2001, 'Fantasy', 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg'),
    ('Il Buono, Il Brutto, Il Cattivo', 1966, 'Western', 'https://image.tmdb.org/t/p/w500/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg'),
    ('Fight Club', 1999, 'Drama', 'https://image.tmdb.org/t/p/w500/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg'),
    ('Forrest Gump', 1994, 'Drama', 'https://image.tmdb.org/t/p/w500/Cw4hIUIAmSYfK9QfaUW5igp9La.jpg'),
    ('Inception', 2010, 'Sci-Fi', 'https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg'),
    ('The Lord of the Rings: The Two Towers', 2002, 'Fantasy', 'https://image.tmdb.org/t/p/w500/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg'),
    ('Star Wars: Episode V - The Empire Strikes Back', 1980, 'Sci-Fi', 'https://image.tmdb.org/t/p/w500/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg'),
    ('The Matrix', 1999, 'Sci-Fi', 'https://image.tmdb.org/t/p/w500/aOIuZAjPaRIE6CMzbazvcHuHXDc.jpg'),
    ('GoodFellas', 1990, 'Biography', 'https://image.tmdb.org/t/p/w500/9OkCLM73MIU2CrKZbqiT8Ln1wY2.jpg'),
    ('One Flew Over the Cuckoo''s Nest', 1975, 'Drama', 'https://image.tmdb.org/t/p/w500/kjWsMh72V6d8KRLV4EOoSJLT1H7.jpg'),
    ('Seven Samurai', 1954, 'Action', 'https://image.tmdb.org/t/p/w500/lOMGc8bnSwQhS4XyE1S99uH8NXf.jpg'),
    ('Se7en', 1995, 'Crime', 'https://image.tmdb.org/t/p/w500/191nKfP0ehp3uIvWqgPbFmI4lv9.jpg'),
    ('The Silence of the Lambs', 1991, 'Thriller', 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg'),
    ('City of God', 2002, 'Crime', 'https://image.tmdb.org/t/p/w500/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg'),
    ('It''s a Wonderful Life', 1946, 'Drama', 'https://image.tmdb.org/t/p/w500/bSqt9rhDZx1Q7UZ86dBPKdNomp2.jpg'),
    ('Life Is Beautiful', 1997, 'Comedy', 'https://image.tmdb.org/t/p/w500/6tEJnof1DKWPnl5lzkjf0FVv7oB.jpg'),
    ('Star Wars: Episode IV - A New Hope', 1977, 'Sci-Fi', 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg'),
    ('Saving Private Ryan', 1998, 'Drama', 'https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg'),
    ('Spirited Away', 2001, 'Animation', 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg'),
    ('The Green Mile', 1999, 'Crime', 'https://image.tmdb.org/t/p/w500/8VG8fDNiy50H4FedGwdSVUPoaJe.jpg'),
    ('Interstellar', 2014, 'Sci-Fi', 'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg'),
    ('Parasite', 2019, 'Thriller', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'),
    ('Léon: The Professional', 1994, 'Action', 'https://image.tmdb.org/t/p/w500/bxB2q91nKYp8JNzqE7t7TWBVupB.jpg'),
    ('The Usual Suspects', 1995, 'Mystery', 'https://image.tmdb.org/t/p/w500/99X2SgyFunJFXGAYnDv3sb9pnUD.jpg'),
    ('The Lion King', 1994, 'Animation', 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg'),
    ('The Pianist', 2002, 'Biography', 'https://image.tmdb.org/t/p/w500/2hFvxCCWrTmCYwfy7yum0GKRi3Y.jpg'),
    ('Terminator 2: Judgment Day', 1991, 'Action', 'https://image.tmdb.org/t/p/w500/jFTVD4XoWQTcg7wdyJKa8PEds5q.jpg'),
    ('Back to the Future', 1985, 'Adventure', 'https://image.tmdb.org/t/p/w500/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg'),
    ('American History X', 1998, 'Drama', 'https://image.tmdb.org/t/p/w500/x2drgoXYZ8484lqyDj7L1CEVR4T.jpg'),
    ('Modern Times', 1936, 'Comedy', 'https://image.tmdb.org/t/p/w500/7uoiKOEjxBBW0AgDGQWrlfGQ90w.jpg'),
    ('Gladiator', 2000, 'Action', 'https://image.tmdb.org/t/p/w500/wN2xWp1eIwCKOD0BHTcErTBv1Uq.jpg'),
    ('Psycho', 1960, 'Horror', 'https://image.tmdb.org/t/p/w500/yz4QVqPx3h1hD1DfqqQkCq3rmxW.jpg'),
    ('The Departed', 2006, 'Crime', 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg'),
    ('City Lights', 1931, 'Comedy', 'https://image.tmdb.org/t/p/w500/bXNvzjULc9jrOVhGfjcc64uKZmZ.jpg'),
    ('Whiplash', 2014, 'Drama', 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg'),
    ('The Prestige', 2006, 'Mystery', 'https://image.tmdb.org/t/p/w500/Ag2B2KHKQPukjH7WutmgnnSNurZ.jpg'),
    ('The Intouchables', 2011, 'Biography', 'https://image.tmdb.org/t/p/w500/1QU7HKgsQbGpzsJbJK4pAVQV9F5.jpg'),
    ('Casablanca', 1942, 'Romance', 'https://image.tmdb.org/t/p/w500/lGCEKlJo2CnWydQj7aamY7s1S7Q.jpg'),
    ('Once Upon a Time in the West', 1968, 'Western', 'https://image.tmdb.org/t/p/w500/qbYgqOczabWNn2XKwgMtVrntD6P.jpg'),
    ('Rear Window', 1954, 'Mystery', 'https://image.tmdb.org/t/p/w500/ILVF0eJxHMddjxeQhswFtpMtqx.jpg'),
    ('Alien', 1979, 'Sci-Fi', 'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg'),
    ('Cinema Paradiso', 1988, 'Drama', 'https://image.tmdb.org/t/p/w500/gCI2AeMV4IHSewhJkzsur5MEp6R.jpg');

INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES
    (1, 10, 5, 'Honestly, this is one of the greatest cinematic achievements I have ever witnessed. The cinematography utilizes natural lighting in a way that makes every single frame look like a Renaissance painting.

The pacing is deliberate but completely necessary to establish the atmospheric dread. The lead actor gives a career-defining performance that will undoubtedly sweep awards season. My only minor critique is that the second act drags slightly, but the explosive finale more than makes up for it. An absolute must-watch on the biggest screen possible!'),
    (2, 14, 4, 'A incredibly strong entry into the director''s filmography, though it doesn''t quite reach the heights of their earlier work from the late 90s.

What works beautifully here is the sound design and the haunting orchestral score—it keeps you on the edge of your seat even during standard conversational scenes. However, the script leans a bit too heavily on exposition in the middle section, treating the audience like they can''t follow the structural mystery. Still, the chemistry between the two leads carries the emotional weight effortlessly. Solid 4 out of 5.'),
    (3, 25, 2, 'I am genuinely baffled by the rave reviews this is getting across social media. The concept in the trailer looked incredibly promising, but the execution is completely messy.

The film suffers from a massive identity crisis—it can''t decide if it wants to be a psychological thriller, a sci-fi mystery, or a family drama, failing to achieve any of them cleanly. Characters make completely irrational decisions just to push the plot forward, and the dialogue feels like it was generated by an AI trying to sound profound. Two stars solely for the impressive visual effects in the opening sequence.'),
    (4, 5, 5, 'Masterful storytelling from beginning to end. It is rare to see a movie that runs over two and a half hours maintain such a tight, vice-grip hold on the audience''s attention span.

The editing is razor-sharp, cutting between the parallel timelines seamlessly without ever causing confusion. The thematic exploration of grief and generational trauma is handled with incredible nuance and maturity, avoiding cheap Hollywood melodrama. I found myself tearing up in the final ten minutes. Do not sleep on this masterpiece.'),
    (5, 18, 1, 'This was an absolute chore to get through. I came in with incredibly high expectations given the star-studded cast, but it turned out to be a massive waste of talent and production budget.

The script is filled with utterly insufferable, unlikable characters that you actively root against, and the humor falls completely flat in every scene. To make matters worse, the lighting is so aggressively dim and muddy that I could barely tell what was happening during the third-act action sequences. Avoid this at all costs—save your time and money.'),
    (6, 32, 4, 'A very pleasant surprise! I went into the theater expecting a standard, predictable summer blockbuster, but what I got was a clever, subverted take on the entire genre.

The writing is exceptionally witty, packed with meta-commentary that keeps the narrative feeling fresh and self-aware. The practical effects look leagues better than the lazy CGI we usually see these days. It loses a little bit of steam during the generic villain showdown at the end, but the journey getting there is an absolute blast.'),
    (7, 45, 5, 'Some movies are meant to be watched, while others are meant to be experienced. This falls squarely into the latter category.

The director crafts a mesmerizing, hypnotic atmosphere that pulls you directly into the environment. The subtextual layers regarding societal decay and isolation are brilliant, requiring a second viewing to fully unpack everything. The performance by the lead actress is nothing short of mesmerizing—she commands the screen without saying a word. A triumph of modern filmmaking.'),
    (8, 8, 3, 'An incredibly average film that is completely elevated by its phenomenal third act. For the first hour and a half, I was checking my watch constantly due to the agonizingly slow pacing and redundant subplots that went nowhere.

But once the major twist happens, the film kicks into overdrive and delivers a spectacular, mind-bending conclusion. If you have the patience to sit through a tedious setup, the payoff is genuinely rewarding. Otherwise, wait until it streams and watch it on 1.5x speed.'),
    (9, 21, 5, 'Absolute perfection. From the very first tracking shot to the final haunting close-up, the direction is utterly flawless.

The script is incredibly tight, with every single line of dialogue serving a dual purpose for character development and plot progression. The production design perfectly captures the gritty, historical era, making the setting feel like its own living character. It''s rare to see a movie hit every single target it aims for so precisely. This is instantly going into my top ten favorite films of all time.'),
    (10, 15, 2, 'A classic case of style over substance. There is no denying that the cinematography and neon color palettes are absolutely stunning to look at—every frame looks like a high-fashion music video.

Unfortunately, there is almost zero plot holding those pretty pictures together. The characters are completely hollow archetypes with no clear motivations, and the central mystery wraps up with an incredibly lazy, unearned deus ex machina. It''s an enjoyable visual showcase, but a total failure as a narrative piece.'),
    (11, 40, 4, 'This film does a fantastic job handling a very sensitive historical event without feeling exploitative or overly sanitized.

The performances across the board are deeply grounded, capturing the raw human emotion of the situation beautifully. The director shows incredible restraint by focusing on the quiet, intimate moments rather than relying on massive, sensationalized set pieces. My only critique is that the ending felt slightly abrupt, leaving a few minor character arcs unresolved. Highly recommended.'),
    (12, 13, 1, 'I want my two hours back. This movie is an incoherent, bloated disaster that feels like it was pieced together by a committee of studio executives looking at a trend spreadsheet.

The pacing is completely erratic, jumping violently between slapstick comedy and dark, gritty violence without any tonal connective tissue. The soundtrack is incredibly distracting, blasting pop songs over dramatic scenes where they completely ruin the emotional gravity. A total mess from start to finish.'),
    (13, 27, 4, 'An exceptionally well-made thriller that manages to keep the tension high despite taking place almost entirely in a single room.

The script is a masterclass in escalating stakes, revealing just enough information at key intervals to keep the audience guessing who is telling the truth. The tight, claustrophobic camera angles amplify the feeling of paranoia beautifully. It stumbles slightly with a predictable final twist, but the incredible acting performances make it well worth watching.'),
    (14, 9, 5, 'Wow. I am completely speechless. I walked into this movie completely blind and walked out feeling emotionally overwhelmed in the best way possible.

The story is devastatingly beautiful, capturing the complexities of human relationships with heartbreaking honesty. The musical score is hauntingly beautiful, lingering in your head long after the credits roll. It is a rare, poetic piece of cinema that demands your full attention and rewards you with an unforgettable experience. A true work of art.'),
    (15, 33, 3, 'A perfectly fine movie that doesn''t take any risks. The acting is decent, the directing is competent, and the story beats happen exactly when you expect them to based on standard three-act structure.

It''s the ultimate "background noise" film—enjoyable while you are watching it, but completely forgettable the moment you leave the theater. If you are looking for an easy, entertaining watch that won''t challenge your brain at all, this fits the bill perfectly.'),
    (16, 50, 5, 'An absolute triumph. This is how you close out a trilogy! The stakes feel genuinely real, the character arcs that have been building for years get deeply satisfying payoffs, and the emotional resonance is massive.

The action sequences are beautifully choreographed and easy to follow, a massive relief from the shaky-cam trends dominating modern cinema. It is an incredibly satisfying conclusion that honors the characters and the fans perfectly.'),
    (17, 3, 4, 'A beautifully shot, deeply melancholic look at modern isolation. The director uses architecture and wide framing to emphasize how lonely the characters are despite living in a dense, bustling metropolis.

The performances are quiet and understated, relying heavily on subtle facial expressions rather than grand monologues. It''s a slow burn that requires some patience, but if you sink into its moody rhythm, it is an incredibly rewarding and empathetic piece of work.'),
    (18, 12, 2, 'A massive disappointment. The original film is an undisputed classic, but this legacy sequel feels like a cynical, uninspired cash grab designed to capitalize on nostalgia.

It rehashes the exact same plot points as the original but executes them with half the charm and double the unnecessary CGI. New characters are introduced but given absolutely zero development, existing solely to set up potential spin-offs. Do yourself a favor and just rewatch the original instead.'),
    (19, 42, 5, 'Brilliant, sharp, and relentlessly funny. This is the best satirical comedy I have seen in a decade. The script takes aim at modern tech culture and slices through the hypocrisy with surgical precision.

The comedic timing of the ensemble cast is flawless, with background gags and rapid-fire dialogue that require multiple viewings to catch everything. Beneath the laugh-out-loud comedy is a genuinely terrifying and accurate critique of our current societal trajectory. Phenomenal work!'),
    (20, 1, 4, 'A very strong biographical drama that avoids the standard "cradle-to-grave" biopic traps by focusing heavily on one crucial week in the subject''s life.

This narrow focus allows for incredible character depth and intense psychological exploration. The lead actor is unrecognizable, disappearing into the role completely. The historical production design is immaculate, making you feel like a fly on the wall in those smoke-filled rooms. A bit dry in the middle, but thoroughly engaging overall.'),
    (4, 1, 5, 'What a film. The kind of cinema that reminds you why this medium matters. Performances are uniformly excellent.'),
    (8, 2, 4, 'Solid 4. The lead performance is genuinely great and the script is sharp. A couple of subplots don''t quite land but they don''t drag the whole down.'),
    (19, 2, 5, 'A masterclass. The direction is so confident it borders on arrogant, and the film completely earns that confidence.'),
    (2, 3, 5, 'Easy 5 stars. Doesn''t waste a single minute, and the ending lands without feeling earned at the audience''s expense.'),
    (8, 4, 4, 'Really strong overall. Loses a half-star for a third act that overstays its welcome by ten minutes, but everything before that is excellent.'),
    (19, 4, 5, 'This is what people mean when they talk about a movie that ''sticks with you''. Three days later and I''m still chewing on it.'),
    (15, 5, 5, 'Top-tier. The kind of film you immediately want to share with someone who''ll appreciate it.'),
    (9, 6, 2, 'Pretty disappointed. The trailer promised something the film never delivers, and the pacing is genuinely punishing in the middle hour.'),
    (6, 6, 3, 'Fine. Competently made, nothing particularly memorable.'),
    (9, 7, 5, 'Absolutely floored. I went in skeptical because of the hype and came out understanding every word of it. Best thing I''ve seen this year.'),
    (4, 7, 5, 'Caught this on a recommendation and ended up recommending it to three people the next day. Genuinely held up better than I expected.'),
    (13, 8, 2, 'Skip it. The premise is interesting on paper but the execution is sloppy from the first act.'),
    (2, 9, 3, 'Some great scenes stranded in a film that doesn''t quite know what it wants to be.'),
    (5, 10, 1, 'Painful. The dialogue alone is enough to recommend against it.'),
    (3, 11, 4, 'Walked out happy. The score alone is worth the watch.'),
    (13, 11, 3, 'Middle of the road. Some genuinely good moments interspersed with stretches where the pacing drags.'),
    (2, 12, 3, 'Decent. Has enough going for it that I''d recommend it for a specific mood, but not as a general pick.'),
    (3, 13, 2, 'Two stars and that''s being generous. The script is thin and leans on the cast to carry material that wasn''t quite there.'),
    (14, 14, 4, 'A confident piece of filmmaking. The cinematography is doing a lot of quiet work that I didn''t fully appreciate until the second viewing.'),
    (6, 15, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (9, 16, 3, 'Middle of the road. Some genuinely good moments interspersed with stretches where the pacing drags.'),
    (6, 16, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (6, 17, 4, 'Tight script, great performances, slightly muddled ending. Still well worth the watch.'),
    (19, 17, 5, 'Absolutely floored. I went in skeptical because of the hype and came out understanding every word of it. Best thing I''ve seen this year.'),
    (2, 18, 4, 'Really strong overall. Loses a half-star for a third act that overstays its welcome by ten minutes, but everything before that is excellent.'),
    (11, 19, 4, 'Solid 4. The lead performance is genuinely great and the script is sharp. A couple of subplots don''t quite land but they don''t drag the whole down.'),
    (7, 19, 1, 'Total mess. The kind of film that makes you appreciate how hard good filmmaking actually is.'),
    (11, 20, 5, 'Cried twice. Genuinely beautiful filmmaking from the opening shot to the final cut.'),
    (14, 20, 2, 'Two stars. The cinematography saves it from a one.'),
    (5, 21, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (18, 22, 4, 'Walked out happy. The score alone is worth the watch.'),
    (14, 22, 1, 'Painful. The dialogue alone is enough to recommend against it.'),
    (12, 23, 5, 'Phenomenal craft. The way the story unfolds rewards patience without ever feeling slow. I''ll be thinking about this for a while.'),
    (18, 23, 4, 'Really strong overall. Loses a half-star for a third act that overstays its welcome by ten minutes, but everything before that is excellent.'),
    (4, 24, 5, 'Phenomenal craft. The way the story unfolds rewards patience without ever feeling slow. I''ll be thinking about this for a while.'),
    (15, 24, 3, 'Three stars feels right. Not a waste of time but not something I''d revisit.'),
    (14, 25, 3, 'Inoffensive. The script does the job and the actors show up. Could have been more.'),
    (17, 26, 4, 'Better than the reviews led me to believe. The character work is the strongest part.'),
    (1, 26, 3, 'Middle of the road. Some genuinely good moments interspersed with stretches where the pacing drags.'),
    (19, 27, 3, 'Fine. Competently made, nothing particularly memorable.'),
    (4, 28, 4, 'Liked this a lot more than I expected. The pacing is patient in a way that pays off if you let it.'),
    (16, 28, 5, 'What a film. The kind of cinema that reminds you why this medium matters. Performances are uniformly excellent.'),
    (17, 29, 3, 'Some great scenes stranded in a film that doesn''t quite know what it wants to be.'),
    (4, 29, 2, 'Skip it. The premise is interesting on paper but the execution is sloppy from the first act.'),
    (17, 30, 3, 'Watchable. I don''t regret seeing it but I wouldn''t go back. Fine background-watch material.'),
    (12, 30, 3, 'Some great scenes stranded in a film that doesn''t quite know what it wants to be.'),
    (17, 31, 1, 'Total mess. The kind of film that makes you appreciate how hard good filmmaking actually is.'),
    (11, 31, 4, 'Solid 4. The lead performance is genuinely great and the script is sharp. A couple of subplots don''t quite land but they don''t drag the whole down.'),
    (13, 32, 2, 'Skip it. The premise is interesting on paper but the execution is sloppy from the first act.'),
    (8, 33, 5, 'Top-tier. The kind of film you immediately want to share with someone who''ll appreciate it.'),
    (3, 34, 5, 'Cried twice. Genuinely beautiful filmmaking from the opening shot to the final cut.'),
    (4, 34, 1, 'Total mess. The kind of film that makes you appreciate how hard good filmmaking actually is.'),
    (5, 35, 5, 'Cried twice. Genuinely beautiful filmmaking from the opening shot to the final cut.'),
    (19, 35, 5, 'This is what people mean when they talk about a movie that ''sticks with you''. Three days later and I''m still chewing on it.'),
    (20, 36, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (18, 36, 3, 'Mixed feelings. The first half is stronger than the second, and the ending feels like the writers ran out of ideas.'),
    (10, 37, 4, 'A confident piece of filmmaking. The cinematography is doing a lot of quiet work that I didn''t fully appreciate until the second viewing.'),
    (16, 37, 1, 'Painful. The dialogue alone is enough to recommend against it.'),
    (4, 38, 4, 'Solid 4. The lead performance is genuinely great and the script is sharp. A couple of subplots don''t quite land but they don''t drag the whole down.'),
    (12, 38, 5, 'This is what people mean when they talk about a movie that ''sticks with you''. Three days later and I''m still chewing on it.'),
    (8, 39, 3, 'Okay. Not bad, not great. The premise has more potential than the execution delivers, but the leads are charismatic enough to carry it.'),
    (3, 39, 3, 'Okay. Not bad, not great. The premise has more potential than the execution delivers, but the leads are charismatic enough to carry it.'),
    (8, 40, 5, 'An absolute knockout. The kind of movie I wanted to watch again the moment the credits rolled.

Every scene feels deliberate, every performance earned. Hard to fault.'),
    (11, 41, 5, 'Easy 5 stars. Doesn''t waste a single minute, and the ending lands without feeling earned at the audience''s expense.'),
    (9, 41, 3, 'Mixed feelings. The first half is stronger than the second, and the ending feels like the writers ran out of ideas.'),
    (18, 42, 5, 'Top-tier. The kind of film you immediately want to share with someone who''ll appreciate it.'),
    (19, 43, 4, 'Held my attention from start to finish. The tonal shifts are handled better than most films manage.'),
    (14, 43, 5, 'Caught this on a recommendation and ended up recommending it to three people the next day. Genuinely held up better than I expected.'),
    (14, 44, 4, 'Strong recommend. Not life-changing but a really well-made movie that respects the audience.'),
    (16, 44, 2, 'Pretty disappointed. The trailer promised something the film never delivers, and the pacing is genuinely punishing in the middle hour.'),
    (4, 45, 5, 'Absolutely floored. I went in skeptical because of the hype and came out understanding every word of it. Best thing I''ve seen this year.'),
    (4, 46, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (19, 46, 4, 'Strong recommend. Not life-changing but a really well-made movie that respects the audience.'),
    (6, 47, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (3, 47, 4, 'Better than the reviews led me to believe. The character work is the strongest part.'),
    (4, 48, 5, 'This is what people mean when they talk about a movie that ''sticks with you''. Three days later and I''m still chewing on it.'),
    (1, 48, 1, 'One of the worst things I''ve sat through this year. Avoid.'),
    (6, 49, 4, 'Held my attention from start to finish. The tonal shifts are handled better than most films manage.'),
    (8, 49, 2, 'Pretty disappointed. The trailer promised something the film never delivers, and the pacing is genuinely punishing in the middle hour.'),
    (6, 50, 4, 'Strong recommend. Not life-changing but a really well-made movie that respects the audience.'),
    (20, 17, 5, 'Absolutely floored. I went in skeptical because of the hype and came out understanding every word of it. Best thing I''ve seen this year.'),
    (2, 17, 5, 'Cried twice. Genuinely beautiful filmmaking from the opening shot to the final cut.'),
    (8, 17, 5, 'This is what people mean when they talk about a movie that ''sticks with you''. Three days later and I''m still chewing on it.'),
    (3, 17, 2, 'Two stars and that''s being generous. The script is thin and leans on the cast to carry material that wasn''t quite there.'),
    (3, 30, 3, 'Mixed feelings. The first half is stronger than the second, and the ending feels like the writers ran out of ideas.'),
    (15, 30, 5, 'Top-tier. The kind of film you immediately want to share with someone who''ll appreciate it.'),
    (9, 30, 3, 'Okay. Not bad, not great. The premise has more potential than the execution delivers, but the leads are charismatic enough to carry it.'),
    (13, 30, 5, 'Top-tier. The kind of film you immediately want to share with someone who''ll appreciate it.'),
    (14, 30, 3, 'Decent. Has enough going for it that I''d recommend it for a specific mood, but not as a general pick.'),
    (5, 30, 3, 'Fine. Competently made, nothing particularly memorable.'),
    (6, 30, 4, 'Liked this a lot more than I expected. The pacing is patient in a way that pays off if you let it.'),
    (20, 30, 3, 'Inoffensive. The script does the job and the actors show up. Could have been more.'),
    (3, 19, 5, 'Top-tier. The kind of film you immediately want to share with someone who''ll appreciate it.'),
    (5, 19, 5, 'Easy 5 stars. Doesn''t waste a single minute, and the ending lands without feeling earned at the audience''s expense.'),
    (13, 19, 5, 'Absolutely floored. I went in skeptical because of the hype and came out understanding every word of it. Best thing I''ve seen this year.'),
    (20, 19, 5, 'Easy 5 stars. Doesn''t waste a single minute, and the ending lands without feeling earned at the audience''s expense.'),
    (9, 19, 4, 'Held my attention from start to finish. The tonal shifts are handled better than most films manage.'),
    (15, 19, 3, 'Solid B-tier. If you''ve already seen everything else worth watching, sure.'),
    (1, 28, 3, 'Some great scenes stranded in a film that doesn''t quite know what it wants to be.'),
    (12, 28, 2, 'Two stars and that''s being generous. The script is thin and leans on the cast to carry material that wasn''t quite there.'),
    (7, 28, 4, 'Solid 4. The lead performance is genuinely great and the script is sharp. A couple of subplots don''t quite land but they don''t drag the whole down.'),
    (17, 28, 3, 'Decent. Has enough going for it that I''d recommend it for a specific mood, but not as a general pick.'),
    (8, 28, 3, 'Fine. Competently made, nothing particularly memorable.'),
    (6, 28, 3, 'Decent. Has enough going for it that I''d recommend it for a specific mood, but not as a general pick.'),
    (15, 28, 4, 'Really strong overall. Loses a half-star for a third act that overstays its welcome by ten minutes, but everything before that is excellent.'),
    (3, 28, 3, 'Decent. Has enough going for it that I''d recommend it for a specific mood, but not as a general pick.'),
    (1, 45, 4, 'Liked this a lot more than I expected. The pacing is patient in a way that pays off if you let it.'),
    (12, 45, 5, 'Cried twice. Genuinely beautiful filmmaking from the opening shot to the final cut.'),
    (18, 45, 3, 'Middle of the road. Some genuinely good moments interspersed with stretches where the pacing drags.'),
    (3, 45, 2, 'Didn''t work for me. The tonal whiplash between scenes is exhausting, and none of the characters earn the emotional beats the film keeps asking for.'),
    (2, 36, 2, 'Didn''t work for me. The tonal whiplash between scenes is exhausting, and none of the characters earn the emotional beats the film keeps asking for.'),
    (15, 36, 5, 'What a film. The kind of cinema that reminds you why this medium matters. Performances are uniformly excellent.'),
    (13, 36, 2, 'Pretty disappointed. The trailer promised something the film never delivers, and the pacing is genuinely punishing in the middle hour.'),
    (19, 36, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (12, 36, 5, 'This is what people mean when they talk about a movie that ''sticks with you''. Three days later and I''m still chewing on it.'),
    (8, 36, 2, 'Didn''t work for me. The tonal whiplash between scenes is exhausting, and none of the characters earn the emotional beats the film keeps asking for.'),
    (5, 36, 2, 'Didn''t work for me. The tonal whiplash between scenes is exhausting, and none of the characters earn the emotional beats the film keeps asking for.'),
    (10, 36, 5, 'Absolutely floored. I went in skeptical because of the hype and came out understanding every word of it. Best thing I''ve seen this year.'),
    (8, 43, 4, 'Solid 4. The lead performance is genuinely great and the script is sharp. A couple of subplots don''t quite land but they don''t drag the whole down.'),
    (15, 43, 2, 'Two stars. The cinematography saves it from a one.'),
    (9, 43, 4, 'Held my attention from start to finish. The tonal shifts are handled better than most films manage.'),
    (6, 43, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (4, 43, 5, 'Easy 5 stars. Doesn''t waste a single minute, and the ending lands without feeling earned at the audience''s expense.'),
    (11, 43, 4, 'Solid 4. The lead performance is genuinely great and the script is sharp. A couple of subplots don''t quite land but they don''t drag the whole down.'),
    (7, 43, 4, 'Better than the reviews led me to believe. The character work is the strongest part.'),
    (20, 32, 4, 'Really strong overall. Loses a half-star for a third act that overstays its welcome by ten minutes, but everything before that is excellent.'),
    (4, 32, 2, 'Skip it. The premise is interesting on paper but the execution is sloppy from the first act.'),
    (8, 32, 3, 'Decent. Has enough going for it that I''d recommend it for a specific mood, but not as a general pick.'),
    (1, 32, 5, 'A masterclass. The direction is so confident it borders on arrogant, and the film completely earns that confidence.'),
    (10, 32, 3, 'Fine. Competently made, nothing particularly memorable.'),
    (12, 32, 3, 'Some great scenes stranded in a film that doesn''t quite know what it wants to be.'),
    (3, 32, 4, 'Walked out happy. The score alone is worth the watch.'),
    (11, 10, 5, 'A masterclass. The direction is so confident it borders on arrogant, and the film completely earns that confidence.'),
    (2, 10, 3, 'Some great scenes stranded in a film that doesn''t quite know what it wants to be.'),
    (10, 10, 4, 'Solid 4. The lead performance is genuinely great and the script is sharp. A couple of subplots don''t quite land but they don''t drag the whole down.'),
    (16, 10, 2, 'Hard pass on a rewatch. I was checking my phone by the 45-minute mark.'),
    (17, 10, 2, 'Skip it. The premise is interesting on paper but the execution is sloppy from the first act.'),
    (11, 13, 3, 'Fine. Competently made, nothing particularly memorable.'),
    (16, 13, 3, 'Some great scenes stranded in a film that doesn''t quite know what it wants to be.'),
    (6, 13, 4, 'Strong recommend. Not life-changing but a really well-made movie that respects the audience.'),
    (15, 13, 3, 'Watchable. I don''t regret seeing it but I wouldn''t go back. Fine background-watch material.'),
    (14, 13, 3, 'Three stars feels right. Not a waste of time but not something I''d revisit.'),
    (13, 13, 2, 'Skip it. The premise is interesting on paper but the execution is sloppy from the first act.'),
    (7, 13, 4, 'Walked out happy. The score alone is worth the watch.'),
    (19, 13, 3, 'Inoffensive. The script does the job and the actors show up. Could have been more.'),
    (17, 48, 3, 'Some great scenes stranded in a film that doesn''t quite know what it wants to be.'),
    (19, 48, 3, 'Watchable. I don''t regret seeing it but I wouldn''t go back. Fine background-watch material.'),
    (5, 48, 4, 'Walked out happy. The score alone is worth the watch.'),
    (9, 48, 5, 'Easy 5 stars. Doesn''t waste a single minute, and the ending lands without feeling earned at the audience''s expense.'),
    (15, 48, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (6, 48, 5, 'Easy 5 stars. Doesn''t waste a single minute, and the ending lands without feeling earned at the audience''s expense.'),
    (13, 48, 3, 'Middle of the road. Some genuinely good moments interspersed with stretches where the pacing drags.'),
    (16, 14, 2, 'Rough. There''s a good movie buried in here somewhere but the editing room didn''t find it.'),
    (15, 14, 4, 'Genuinely good. Wouldn''t put it in my all-time list but I''d recommend it without reservation.'),
    (6, 14, 3, 'Okay. Not bad, not great. The premise has more potential than the execution delivers, but the leads are charismatic enough to carry it.'),
    (20, 14, 3, 'Middle of the road. Some genuinely good moments interspersed with stretches where the pacing drags.'),
    (18, 14, 4, 'Liked this a lot more than I expected. The pacing is patient in a way that pays off if you let it.'),
    (19, 14, 2, 'Two stars. The cinematography saves it from a one.'),
    (1, 14, 3, 'Middle of the road. Some genuinely good moments interspersed with stretches where the pacing drags.'),
    (15, 9, 2, 'Hard pass on a rewatch. I was checking my phone by the 45-minute mark.');
