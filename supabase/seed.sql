-- Seed: native-language idioms + cross-language translations + equivalents.

insert into public.idioms
  (expression, language_code, idiomatic_meaning, explanation, examples, source, status)
values
(
  'Break a leg',
  'en',
  'A superstitious way to wish someone good luck, especially before a performance.',
  'Believed to originate in early 20th-century theater culture, where wishing someone ''good luck'' directly was considered bad luck.',
  array['You''re going to do great at the audition — break a leg!', 'The whole team told her to break a leg before the presentation.'],
  'human',
  'published'
),
(
  'Bite the bullet',
  'en',
  'To endure a painful or unpleasant situation that is unavoidable.',
  'Historically, soldiers were given a lead bullet to bite during surgery before anesthesia was available. First written record: Rudyard Kipling, 1891.',
  array['I hate going to the dentist, but I just have to bite the bullet.', 'The company bit the bullet and issued a full recall.'],
  'human',
  'published'
),
(
  'Hit the nail on the head',
  'en',
  'To describe exactly what is causing a situation or problem.',
  'From carpentry — hitting a nail precisely on its head drives it in cleanly, while a glancing blow bends it.',
  array['You hit the nail on the head — that''s exactly what''s wrong.', 'Her analysis hit the nail on the head.'],
  'human',
  'published'
),
(
  'Under the weather',
  'en',
  'Feeling ill or below par.',
  'A nautical expression — a sick sailor would go below deck to shelter from the weather, hence "under the weather".',
  array['I''m feeling a bit under the weather today.', 'She called in sick — she''s been under the weather all week.'],
  'human',
  'published'
),
(
  'Spill the beans',
  'en',
  'To reveal secret information accidentally or prematurely.',
  'Possibly from ancient Greek voting practices using beans, where spilling them would prematurely reveal the tally.',
  array['Don''t spill the beans about the surprise party!', 'He accidentally spilled the beans about the merger.'],
  'human',
  'published'
),
(
  'Estar en las nubes',
  'es',
  'Estar distraído o no prestar atención a lo que está pasando alrededor.',
  'Las nubes evocan una distancia mental respecto al suelo, es decir, a la realidad — quien "está en las nubes" está ausente.',
  array['¡Presta atención! Estás en las nubes otra vez.', 'Durante toda la reunión estuvo en las nubes.'],
  'human',
  'published'
),
(
  'Irse de la lengua',
  'es',
  'Revelar accidentalmente algo que debía permanecer en secreto.',
  'Hace referencia a la lengua que "se escapa" del control — el habla se adelanta a la discreción.',
  array['Se fue de la lengua y contó todo el plan.', 'No le digas nada, siempre se va de la lengua.'],
  'human',
  'published'
);

-- ── Translations ─────────────────────────────────────────────────────────
-- EN idioms → ES (and a sprinkle of FR to exercise multi-language shape)

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Rómpete una pierna',
  'Forma supersticiosa de desear buena suerte, sobre todo antes de una actuación.',
  'Se cree que viene del teatro de principios del siglo XX, donde desear "buena suerte" directamente traía mala suerte.',
  'ai_mined'
from public.idioms i where i.expression = 'Break a leg' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'fr',
  'Casse-toi une jambe',
  'Façon superstitieuse de souhaiter bonne chance, surtout avant une représentation.',
  'Probablement originaire du théâtre du début du XXe siècle, où souhaiter directement "bonne chance" portait malheur.',
  'ai_mined'
from public.idioms i where i.expression = 'Break a leg' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Morder la bala',
  'Soportar una situación dolorosa o desagradable que es inevitable.',
  'Históricamente, a los soldados se les daba una bala de plomo para morder durante una cirugía antes de la anestesia.',
  'ai_mined'
from public.idioms i where i.expression = 'Bite the bullet' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Dar en el clavo',
  'Describir exactamente lo que causa una situación o problema.',
  'De la carpintería — golpear un clavo justo en la cabeza lo clava limpiamente; un golpe oblicuo lo dobla.',
  'ai_mined'
from public.idioms i where i.expression = 'Hit the nail on the head' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Bajo el clima',
  'Sentirse mal o con poca salud.',
  'Expresión náutica — un marinero enfermo bajaba bajo cubierta para refugiarse del mal tiempo, de ahí "bajo el clima".',
  'ai_mined'
from public.idioms i where i.expression = 'Under the weather' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Derramar los frijoles',
  'Revelar información secreta de forma accidental o prematura.',
  'Posiblemente de prácticas de votación de la antigua Grecia con frijoles, donde derramarlos revelaba el recuento antes de tiempo.',
  'ai_mined'
from public.idioms i where i.expression = 'Spill the beans' and i.language_code = 'en';

-- ES idioms → EN

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'en',
  'To be in the clouds',
  'To be daydreaming or not paying attention to what is happening.',
  'Clouds evoke a mental distance from the ground — i.e. reality. Someone "in the clouds" is absent-minded.',
  'ai_mined'
from public.idioms i where i.expression = 'Estar en las nubes' and i.language_code = 'es';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'en',
  'To go off the tongue',
  'To accidentally reveal something that was supposed to stay secret.',
  'Refers to the tongue "escaping" control — speech running ahead of discretion.',
  'ai_mined'
from public.idioms i where i.expression = 'Irse de la lengua' and i.language_code = 'es';

-- ── Tags taxonomy ────────────────────────────────────────────────────────
-- Canonical tag keys + facet. Facet rubric (kept in TS union IdiomTag.facet):
--   theme    — what the idiom is about (food, health, secrets)
--   register — social tone (formal, informal)
--   context  — setting it belongs to (theater, business)
--   meaning  — semantic payload (luck, courage, disclosure)

insert into public.tags (key, facet) values
  ('luck',         'meaning'),
  ('theater',      'context'),
  ('informal',     'register'),
  ('courage',      'meaning'),
  ('endurance',    'meaning'),
  ('formal',       'register'),
  ('accuracy',     'meaning'),
  ('insight',      'meaning'),
  ('health',       'theme'),
  ('illness',      'theme'),
  ('secrets',      'theme'),
  ('disclosure',   'meaning'),
  ('distraction',  'meaning'),
  ('daydreaming',  'meaning');

-- EN labels
insert into public.tag_translations (tag_id, language_code, label)
select id, 'en', initcap(key) from public.tags;

-- ES labels (explicit per tag)
insert into public.tag_translations (tag_id, language_code, label)
select t.id, 'es', v.label
from public.tags t
join (values
  ('luck',         'Suerte'),
  ('theater',      'Teatro'),
  ('informal',     'Informal'),
  ('courage',      'Valor'),
  ('endurance',    'Resistencia'),
  ('formal',       'Formal'),
  ('accuracy',     'Precisión'),
  ('insight',      'Perspicacia'),
  ('health',       'Salud'),
  ('illness',      'Enfermedad'),
  ('secrets',      'Secretos'),
  ('disclosure',   'Revelación'),
  ('distraction',  'Distracción'),
  ('daydreaming',  'Ensoñación')
) as v(key, label) on v.key = t.key;

-- idiom ↔ tag links
insert into public.idiom_tags (idiom_id, tag_id)
select i.id, t.id
from public.idioms i
join (values
  ('Break a leg',              'en', 'luck'),
  ('Break a leg',              'en', 'theater'),
  ('Break a leg',              'en', 'informal'),
  ('Bite the bullet',          'en', 'courage'),
  ('Bite the bullet',          'en', 'endurance'),
  ('Bite the bullet',          'en', 'formal'),
  ('Hit the nail on the head', 'en', 'accuracy'),
  ('Hit the nail on the head', 'en', 'insight'),
  ('Hit the nail on the head', 'en', 'informal'),
  ('Under the weather',        'en', 'health'),
  ('Under the weather',        'en', 'illness'),
  ('Under the weather',        'en', 'informal'),
  ('Spill the beans',          'en', 'secrets'),
  ('Spill the beans',          'en', 'disclosure'),
  ('Spill the beans',          'en', 'informal'),
  ('Estar en las nubes',       'es', 'distraction'),
  ('Estar en las nubes',       'es', 'daydreaming'),
  ('Estar en las nubes',       'es', 'informal'),
  ('Irse de la lengua',        'es', 'secrets'),
  ('Irse de la lengua',        'es', 'disclosure'),
  ('Irse de la lengua',        'es', 'informal')
) as v(expression, language_code, tag_key)
  on v.expression = i.expression and v.language_code = i.language_code
join public.tags t on t.key = v.tag_key;

-- ── Cross-language equivalent with similarity score ──────────────────────
-- "Spill the beans" (en) ↔ "Irse de la lengua" (es) — very close, 0.92.
insert into public.idiom_equivalents (idiom_id_a, idiom_id_b, verified, similarity_score)
select
  least(en.id, es.id),
  greatest(en.id, es.id),
  true,
  0.92
from
  (select id from public.idioms where expression = 'Spill the beans' and language_code = 'en') en,
  (select id from public.idioms where expression = 'Irse de la lengua' and language_code = 'es') es;

-- ── Cross-language equivalents of "Bite the bullet" ──────────────────────
-- ES, FR, DE native idioms expressing the same idea, linked via idiom_equivalents.

insert into public.idioms
  (expression, language_code, idiomatic_meaning, explanation, examples, source, status)
values
(
  'Hacer de tripas corazón',
  'es',
  'Armarse de valor para afrontar una situación difícil o desagradable.',
  'Literalmente "hacer corazón con las tripas" — convertir las vísceras (sede del miedo en la tradición popular) en corazón (valentía). Documentada desde el Siglo de Oro.',
  array['Hice de tripas corazón y le dije la verdad.', 'Tuvo que hacer de tripas corazón para entrar al quirófano.'],
  'human',
  'published'
),
(
  'Prendre son courage à deux mains',
  'fr',
  'Rassembler tout son courage pour faire quelque chose de difficile ou d''effrayant.',
  'Image d''empoigner son courage fermement, comme on saisirait un objet à deux mains pour ne pas le laisser tomber. Attestée depuis le XVIIe siècle.',
  array['Elle a pris son courage à deux mains et a démissionné.', 'Prends ton courage à deux mains et appelle-le.'],
  'human',
  'published'
),
(
  'In den sauren Apfel beißen',
  'de',
  'Eine unangenehme, aber unvermeidliche Aufgabe in Angriff nehmen.',
  'Wörtlich "in den sauren Apfel beißen" — etwas Unangenehmes hinunterwürgen. Belegt seit Luthers Zeit (16. Jh.) als Bild für widerwilliges Erdulden.',
  array['Ich muss in den sauren Apfel beißen und zum Zahnarzt gehen.', 'Am Ende biss er in den sauren Apfel und entschuldigte sich.'],
  'human',
  'published'
);

-- Translations: each new idiom rendered in the other 3 languages.
insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, v.language_code, v.literal_translation, v.idiomatic_meaning, v.explanation, 'ai_mined'
from public.idioms i
join (values
  -- Hacer de tripas corazón
  ('Hacer de tripas corazón', 'es', 'en', 'To make heart out of guts',
    'To steel oneself to face a difficult or unpleasant situation.',
    'Literally "to make a heart out of one''s guts" — turning the viscera (folkloric seat of fear) into a heart (courage). Attested from the Spanish Golden Age.'),
  ('Hacer de tripas corazón', 'es', 'fr', 'Faire un cœur de tripes',
    'Se forcer au courage pour affronter une situation difficile ou désagréable.',
    'Littéralement "faire un cœur avec les tripes" — transformer les viscères (siège populaire de la peur) en cœur (courage). Attestée depuis le Siècle d''or espagnol.'),
  ('Hacer de tripas corazón', 'es', 'de', 'Aus Eingeweiden ein Herz machen',
    'Sich Mut antun, um eine schwierige oder unangenehme Lage zu meistern.',
    'Wörtlich "aus den Eingeweiden ein Herz machen" — die Eingeweide (volkstümlich Sitz der Angst) in Herz (Mut) verwandeln. Belegt seit dem spanischen Goldenen Zeitalter.'),
  -- Prendre son courage à deux mains
  ('Prendre son courage à deux mains', 'fr', 'en', 'To take one''s courage in both hands',
    'To gather up all one''s courage to do something hard or scary.',
    'Image of gripping one''s courage firmly, as one would grasp an object with both hands to avoid dropping it. Attested since the 17th century.'),
  ('Prendre son courage à deux mains', 'fr', 'es', 'Tomar el valor con las dos manos',
    'Reunir todo el valor para hacer algo difícil o que da miedo.',
    'Imagen de agarrar el propio valor con firmeza, como se sujetaría un objeto con ambas manos para no dejarlo caer. Atestiguada desde el siglo XVII.'),
  ('Prendre son courage à deux mains', 'fr', 'de', 'Seinen Mut mit beiden Händen ergreifen',
    'Allen Mut zusammennehmen, um etwas Schwieriges oder Beängstigendes zu tun.',
    'Bild des festen Zugreifens nach dem eigenen Mut, wie man einen Gegenstand mit beiden Händen hält, um ihn nicht fallen zu lassen. Belegt seit dem 17. Jahrhundert.'),
  -- In den sauren Apfel beißen
  ('In den sauren Apfel beißen', 'de', 'en', 'To bite into the sour apple',
    'To take on an unpleasant but unavoidable task.',
    'Literally "to bite into the sour apple" — to swallow something disagreeable. Attested since Luther''s time (16th century) as an image of reluctant endurance.'),
  ('In den sauren Apfel beißen', 'de', 'es', 'Morder la manzana ácida',
    'Asumir una tarea desagradable pero inevitable.',
    'Literalmente "morder la manzana ácida" — tragar algo desagradable. Atestiguada desde la época de Lutero (siglo XVI) como imagen de aguante a regañadientes.'),
  ('In den sauren Apfel beißen', 'de', 'fr', 'Mordre dans la pomme acide',
    'S''attaquer à une tâche désagréable mais inévitable.',
    'Littéralement "mordre dans la pomme acide" — avaler quelque chose de désagréable. Attestée depuis l''époque de Luther (XVIe siècle) comme image d''une endurance résignée.')
) as v(expression, parent_lang, language_code, literal_translation, idiomatic_meaning, explanation)
  on v.expression = i.expression and v.parent_lang = i.language_code;

-- Tag links: courage + endurance + informal for all three.
insert into public.idiom_tags (idiom_id, tag_id)
select i.id, t.id
from public.idioms i
join (values
  ('Hacer de tripas corazón',          'es', 'courage'),
  ('Hacer de tripas corazón',          'es', 'endurance'),
  ('Hacer de tripas corazón',          'es', 'informal'),
  ('Prendre son courage à deux mains', 'fr', 'courage'),
  ('Prendre son courage à deux mains', 'fr', 'endurance'),
  ('Prendre son courage à deux mains', 'fr', 'informal'),
  ('In den sauren Apfel beißen',       'de', 'courage'),
  ('In den sauren Apfel beißen',       'de', 'endurance'),
  ('In den sauren Apfel beißen',       'de', 'informal')
) as v(expression, language_code, tag_key)
  on v.expression = i.expression and v.language_code = i.language_code
join public.tags t on t.key = v.tag_key;

-- Equivalence edges to "Bite the bullet" (en).
--   DE  in den sauren Apfel beißen           — 0.95 (near-perfect)
--   ES  hacer de tripas corazón              — 0.85
--   FR  prendre son courage à deux mains     — 0.75
insert into public.idiom_equivalents (idiom_id_a, idiom_id_b, verified, similarity_score)
select least(en.id, x.id), greatest(en.id, x.id), true, x.score
from
  (select id from public.idioms where expression = 'Bite the bullet' and language_code = 'en') en,
  (
    select id, 0.85::numeric(3,2) as score from public.idioms where expression = 'Hacer de tripas corazón' and language_code = 'es'
    union all
    select id, 0.75::numeric(3,2) from public.idioms where expression = 'Prendre son courage à deux mains' and language_code = 'fr'
    union all
    select id, 0.95::numeric(3,2) from public.idioms where expression = 'In den sauren Apfel beißen' and language_code = 'de'
  ) x;
