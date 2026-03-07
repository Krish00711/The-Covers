const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Article = require('../models/Article');

dotenv.config({ path: path.join(__dirname, '../.env') });

const articles = [
  {
    title: "The Art of Test Batting — What Separates Greats from Good",
    slug: "art-of-test-batting-greats-vs-good",
    category: "analysis",
    author: "Cricket Analyst",
    content: `Test cricket batting is often described as the ultimate examination of a player's technique, temperament, and mental fortitude. While many players can score runs in limited-overs formats, the five-day format demands a unique combination of patience, concentration, and adaptability that only the truly great possess.

The difference between good and great Test batsmen lies not just in their ability to score runs, but in how they construct their innings. Great batsmen like Sachin Tendulkar, Brian Lara, and Steve Smith have shown an uncanny ability to occupy the crease for extended periods, wearing down bowling attacks through sheer concentration and technical excellence. They understand that Test cricket is as much about survival as it is about scoring.

Technical proficiency forms the foundation of Test batting success. The ability to play both pace and spin with equal comfort, to adjust one's game according to pitch conditions, and to have a solid defensive technique are non-negotiable requirements. Great batsmen possess a complete game - they can defend when necessary, attack when opportunities arise, and most importantly, know which option to choose at any given moment.

Mental strength separates the good from the great. The ability to bat for long periods, to come back after getting out cheaply, to perform under pressure in crucial matches, and to adapt to different conditions around the world - these mental attributes define Test cricket legends. It's not just about talent; it's about the mental resilience to apply that talent consistently over a long career.

The modern era has seen batting techniques evolve, with players like Kane Williamson and Joe Root showing that classical technique combined with modern shot-making can still dominate Test cricket. The art of Test batting continues to evolve, but the fundamental principles remain unchanged - patience, technique, and mental strength will always separate the greats from the merely good.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  },
  {
    title: "The Ashes — 140 Years of Cricket Rivalry",
    slug: "the-ashes-140-years-cricket-rivalry",
    category: "history",
    author: "Cricket Analyst",
    content: `The Ashes represents the oldest and most celebrated rivalry in cricket history. Born from England's shock defeat to Australia at The Oval in 1882, this contest has captivated cricket fans for over 140 years, producing some of the sport's most memorable moments and legendary performances.

The rivalry's name originated from a satirical obituary published in The Sporting Times, which declared that English cricket had died and "the body will be cremated and the ashes taken to Australia." When England toured Australia the following year, a small urn was presented to the English captain, symbolizing the "ashes" of English cricket. This tiny terracotta urn, standing just 11 centimeters tall, has become one of sport's most iconic trophies.

Throughout its history, The Ashes has produced cricket's greatest heroes and most dramatic moments. From Don Bradman's dominance in the 1930s and 1940s to Ian Botham's heroics in 1981, from Shane Warne's "Ball of the Century" to Ben Stokes' miracle at Headingley in 2019, the series has consistently delivered unforgettable cricket. The intensity of the rivalry has pushed players to extraordinary heights and created legends that transcend the sport.

The cultural significance of The Ashes extends beyond cricket. In both England and Australia, the series captures national attention like few other sporting events. The rivalry has shaped cricket's development, influenced playing styles, and created a unique sporting culture that celebrates both fierce competition and mutual respect. It has survived two World Wars, numerous controversies, and the evolution of cricket itself.

As cricket enters a new era dominated by T20 leagues and franchise cricket, The Ashes remains a testament to Test cricket's enduring appeal. The rivalry continues to produce compelling cricket, with each series adding new chapters to this remarkable story. After 140 years, The Ashes remains cricket's greatest contest, a rivalry that defines the sport's rich history and bright future.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  },
  {
    title: "Top 10 Greatest Test Innings of All Time",
    slug: "top-10-greatest-test-innings-all-time",
    category: "features",
    author: "Cricket Analyst",
    content: `Test cricket has witnessed countless memorable innings over its 145-year history, but some performances transcend mere statistics to become defining moments in the sport's rich tapestry. These innings are remembered not just for the runs scored, but for the context, the pressure, and the impact they had on cricket history.

Brian Lara's 153* against Australia in Bridgetown 1999 stands as perhaps the greatest fourth-innings chase in Test history. With the West Indies needing 308 to win and facing one of the strongest Australian attacks ever assembled, Lara produced a masterclass of controlled aggression and nerveless execution. His unbeaten 153 guided the West Indies to a famous victory, showcasing batting at its absolute finest under immense pressure.

Ben Stokes' 135* at Headingley in 2019 redefined what was possible in Test cricket. Needing 73 runs with only one wicket remaining, Stokes produced an innings of such audacity and skill that it seemed to defy logic. His partnership with Jack Leach, who contributed just one run, will be remembered as one of cricket's most improbable victories. The innings combined classical technique with modern innovation, creating a template for future generations.

VVS Laxman's 281 against Australia in Kolkata 2001 changed the course of Indian cricket history. Following on, India seemed destined for defeat against a dominant Australian side. Laxman's elegant strokeplay, combined with Rahab Dravid's 180, turned the match on its head. The innings showcased the beauty of wristy strokeplay and the power of partnership batting, inspiring a generation of Indian cricketers.

Other innings that deserve mention include Botham's 149* at Headingley 1981, Tendulkar's 136 at Chennai 1999 with a back injury, Steve Waugh's 200 at Old Trafford 1997, and Kumar Sangakkara's 192 at Hobart 2007. Each of these innings tells a story of courage, skill, and determination that defines Test cricket's enduring appeal.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  },
  {
    title: "How Test Cricket Has Evolved Since 1877",
    slug: "test-cricket-evolution-since-1877",
    category: "history",
    author: "Cricket Analyst",
    content: `Test cricket's journey from its inception in 1877 to the modern era represents one of sport's most fascinating evolutionary stories. The first Test match between Australia and England at the Melbourne Cricket Ground laid the foundation for a format that would become cricket's ultimate examination, yet the game played today would be barely recognizable to those early pioneers.

The early era of Test cricket, from 1877 to the 1920s, was characterized by uncovered pitches, minimal protective equipment, and a more agricultural style of batting. Bowlers dominated, with matches often decided by the quality of pitch preparation rather than pure skill. The introduction of covered pitches in the mid-20th century fundamentally changed the game, allowing batsmen to play more expansive shots and leading to higher scores and more entertaining cricket.

The post-World War II era saw Test cricket's golden age, with legendary players like Don Bradman, Garfield Sobers, and later Viv Richards redefining what was possible with the bat. This period also saw the emergence of West Indies as a dominant force, their pace quartet revolutionizing fast bowling and setting new standards for aggression and intimidation within the laws of the game. The 1970s and 1980s represented Test cricket at its most competitive and compelling.

The modern era, beginning in the 1990s, has seen unprecedented changes. The introduction of technology - from television replays to DRS - has transformed decision-making. Day-night Tests with pink balls have attempted to make the format more accessible. The rise of T20 cricket has influenced batting techniques, with players incorporating reverse sweeps, ramps, and other innovative shots into Test cricket. The game has become faster-paced, with teams prioritizing result-oriented cricket over attritional draws.

Today's Test cricket faces new challenges and opportunities. While T20 leagues threaten its commercial viability, the format continues to be regarded as cricket's ultimate test. The World Test Championship has added context to bilateral series, while innovations in broadcasting and analysis have made the game more accessible to new audiences. Test cricket's evolution continues, adapting to modern demands while preserving the core values that have made it special for nearly 150 years.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  },
  {
    title: "The Science of Swing Bowling in Test Cricket",
    slug: "science-of-swing-bowling-test-cricket",
    category: "analysis",
    author: "Cricket Analyst",
    content: `Swing bowling represents one of cricket's most beautiful and scientifically fascinating arts. The ability to make a cricket ball deviate through the air has decided countless Test matches and created some of the sport's most memorable spells. Understanding the science behind swing bowling reveals why it remains such a potent weapon in Test cricket's arsenal.

Conventional swing occurs due to the pressure differential created by the ball's seam position and surface condition. When a bowler maintains the seam upright and keeps one side of the ball shiny while allowing the other to roughen, air flows differently over each side. The smooth side experiences laminar flow, while the rough side creates turbulent flow, generating a pressure difference that causes the ball to swing. This fundamental principle has been exploited by great swing bowlers throughout cricket history.

Reverse swing, discovered and perfected by Pakistani fast bowlers in the 1980s and 1990s, operates on different principles. When the ball becomes old and both sides are rough, bowlers can create swing by maintaining one side rougher than the other and bowling at high speeds (typically above 85 mph). The rough side now experiences earlier boundary layer transition, causing the ball to swing in the opposite direction to conventional swing. Wasim Akram and Waqar Younis turned reverse swing into a devastating art form.

Environmental conditions play a crucial role in swing bowling's effectiveness. Humidity, cloud cover, and atmospheric pressure all influence how much a ball will swing. English conditions, with their overcast skies and green pitches, are particularly conducive to swing bowling, which explains why English bowlers have historically been masters of the art. The Dukes ball used in England, with its pronounced seam, swings more than the Kookaburra used in Australia.

Modern Test cricket has seen swing bowling evolve further. Bowlers like James Anderson have demonstrated that skill and understanding of conditions can overcome raw pace. The introduction of pink balls for day-night Tests has added another dimension, as these balls behave differently under lights. As Test cricket continues to evolve, swing bowling remains a crucial skill, combining physics, skill, and cricket intelligence to create one of the game's most compelling spectacles.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  },
  {
    title: "Greatest Test Bowling Spells Ever Recorded",
    slug: "greatest-test-bowling-spells-ever-recorded",
    category: "features",
    author: "Cricket Analyst",
    content: `Test cricket's history is adorned with bowling performances that transcended mere statistics to become legendary moments in the sport. These spells combined skill, determination, and often a touch of genius to produce results that changed matches, series, and sometimes the course of cricket history itself.

Jim Laker's 19 for 90 against Australia at Old Trafford in 1956 remains Test cricket's most extraordinary bowling performance. Taking 19 wickets in a match - including all 10 in the second innings - Laker's off-spin was virtually unplayable on a turning pitch. His figures of 10 for 53 in the second innings represent the best bowling figures in Test history, a record that has stood for nearly 70 years and may never be broken.

Shane Warne's spell on the final day at Adelaide in 2006 showcased leg-spin bowling at its absolute finest. With England needing just 168 runs to win with seven wickets in hand, Warne produced a spell of 4 for 49 that turned the match on its head. His ability to extract turn and bounce from a wearing pitch, combined with his tactical acumen and mental strength, demonstrated why he's considered the greatest leg-spinner in cricket history.

Bob Massie's debut performance at Lord's in 1972 remains one of Test cricket's most remarkable stories. The Australian swing bowler took 16 for 137 in his first Test match, exploiting overcast English conditions to devastating effect. His ability to swing the ball both ways at pace bamboozled England's batsmen, though mysteriously, he never replicated this success and finished his brief Test career with just 31 wickets.

Other legendary spells include Malcolm Marshall's 7 for 53 at Headingley in 1984, bowling with a broken thumb; Curtly Ambrose's 7 for 1 at Perth in 1993, one of the most devastating fast bowling spells ever witnessed; and Muttiah Muralitharan's countless match-winning performances, including his 16 for 220 against England at The Oval in 1998. These performances remind us that Test cricket's greatest moments often belong to bowlers who can produce magic when their team needs it most.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  },
  {
    title: "Home Advantage in Test Cricket — The Numbers",
    slug: "home-advantage-test-cricket-numbers",
    category: "analysis",
    author: "Cricket Analyst",
    content: `Home advantage in Test cricket is one of the sport's most significant yet often underestimated factors. Statistical analysis reveals that teams win approximately 60% of their home Tests compared to just 30% away, with the remaining 10% ending in draws. This substantial disparity raises important questions about what creates home advantage and how it has evolved over time.

Familiarity with local conditions represents the most obvious source of home advantage. Teams that grow up playing on subcontinental pitches develop skills to handle spin bowling that visiting teams often lack. Similarly, Australian and South African teams excel at exploiting pace and bounce that their pitches offer. England's swing-friendly conditions favor their seamers, while West Indian pitches historically produced fast, bouncy tracks that suited their pace batteries. This environmental adaptation creates a significant competitive edge.

The psychological aspects of home advantage extend beyond mere familiarity. Playing in front of supportive crowds, sleeping in your own bed, eating familiar food, and avoiding long-haul travel all contribute to better performance. Conversely, touring teams face jet lag, unfamiliar conditions, and often hostile crowds. The mental challenge of touring, particularly in countries like India, Australia, or England, can be as demanding as the cricket itself.

Modern cricket has seen some erosion of traditional home advantages. Improved preparation, better understanding of conditions through technology and data analysis, and more frequent international cricket have helped touring teams adapt more quickly. The Indian Premier League has exposed players to different conditions and bowling styles, making them more adaptable. Yet despite these changes, home advantage persists, suggesting that some factors are inherent to the format itself.

The data also reveals interesting patterns. Some teams, like Australia and South Africa, have historically been strong both home and away, while others struggle to translate home success into away victories. England's recent struggles in Australia and India's challenges in England and South Africa highlight how difficult it remains to win away from home. As Test cricket evolves, understanding and overcoming home advantage remains one of the format's greatest challenges.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  },
  {
    title: "The Pink Ball Test — Revolution or Gimmick?",
    slug: "pink-ball-test-revolution-or-gimmick",
    category: "analysis",
    author: "Cricket Analyst",
    content: `The introduction of day-night Test cricket with pink balls in 2015 represented one of the format's most significant innovations in decades. Designed to make Test cricket more accessible by allowing matches to be played during evening hours when more people can attend and watch, the pink ball experiment has produced mixed results and continues to divide opinion within the cricket community.

Proponents argue that day-night Tests address Test cricket's biggest challenge - declining attendance and viewership. By scheduling play during evening hours, particularly in countries like Australia where traditional Test cricket struggles to attract crowds, the format has successfully drawn larger audiences. The inaugural day-night Test at Adelaide in 2015 attracted over 120,000 spectators across five days, demonstrating the concept's commercial viability and public appeal.

However, the pink ball itself has created significant challenges. The ball behaves differently under lights, with exaggerated swing and seam movement during twilight periods creating an imbalance between bat and ball. Several day-night Tests have finished inside three days, with batting collapses during the evening session becoming commonplace. The ball also deteriorates differently than red balls, affecting spin bowling and making it harder for spinners to grip and turn the ball effectively.

Players have expressed mixed views about day-night Tests. Some enjoy the challenge and atmosphere, while others feel the pink ball fundamentally alters Test cricket's balance. Batsmen particularly struggle during the twilight period when visibility becomes challenging and the ball moves unpredictably. Bowlers, especially fast bowlers, have generally been more positive, enjoying the additional assistance the pink ball provides under lights.

The future of day-night Tests likely lies in finding the right balance. Improvements in ball manufacturing have addressed some early issues, and players are gradually adapting to the format's unique challenges. While day-night Tests may never completely replace traditional Test cricket, they represent a valuable tool for keeping the format relevant and accessible. Whether revolution or gimmick, pink ball Tests have sparked important conversations about Test cricket's future and demonstrated that innovation, when carefully implemented, can coexist with tradition.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  },
  {
    title: "Best Test Cricket Venues in the World",
    slug: "best-test-cricket-venues-world",
    category: "features",
    author: "Cricket Analyst",
    content: `Test cricket's greatest venues are more than just sporting arenas - they are cathedrals of the game, each with unique character, history, and atmosphere that makes them special. These grounds have witnessed cricket's most memorable moments and continue to provide the stage for the sport's ultimate examination.

Lord's Cricket Ground in London holds a special place in cricket's heart as the "Home of Cricket." Founded in 1814, Lord's combines tradition with modern facilities, its famous slope adding a unique dimension to the game. The Pavilion, with its Long Room where players walk through members to reach the field, creates an atmosphere unlike any other venue. Hosting the first-ever Test match in England and countless historic moments since, Lord's remains Test cricket's most iconic venue.

The Melbourne Cricket Ground represents Test cricket's grandest stage. With a capacity exceeding 100,000, the MCG's Boxing Day Test has become an Australian institution, regularly attracting crowds of 80,000-plus. The ground's vast dimensions, bouncy pitch, and electric atmosphere during Ashes Tests make it a bucket-list destination for cricket fans worldwide. The MCG has hosted more Test matches than any other venue and continues to set standards for cricket infrastructure.

Eden Gardens in Kolkata embodies the passion and intensity of Indian cricket. With a capacity of 66,000, the ground creates an atmosphere that can be intimidating for visiting teams and inspiring for India. The venue's most famous moment came in 2001 when India, following on against Australia, produced one of Test cricket's greatest comebacks. The crowd's knowledge and enthusiasm make Eden Gardens a truly special place to watch Test cricket.

Other venues that deserve mention include Newlands in Cape Town, with Table Mountain providing a stunning backdrop; Lord's spiritual rival, The Oval in London; Sydney Cricket Ground with its heritage and character; and Galle International Stadium in Sri Lanka, where the fort and ocean create a unique setting. Each of these venues contributes to Test cricket's rich tapestry, providing the stages where the game's greatest dramas unfold.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  },
  {
    title: "The Future of Test Cricket in the T20 Era",
    slug: "future-test-cricket-t20-era",
    category: "analysis",
    author: "Cricket Analyst",
    content: `Test cricket faces its greatest existential challenge in the T20 era. As franchise leagues proliferate and offer lucrative contracts, players increasingly prioritize limited-overs cricket over the traditional format. Yet despite these challenges, Test cricket retains unique qualities that suggest it can not only survive but thrive in the modern cricket landscape.

The commercial reality cannot be ignored. T20 leagues generate more revenue in three hours than many Test matches do in five days. Players can earn more in a six-week IPL season than in a year of Test cricket. This economic disparity has led some players to retire from Test cricket prematurely or prioritize franchise commitments over international duty. Cricket boards face difficult decisions about how to balance formats and ensure Test cricket remains financially viable.

However, Test cricket possesses inherent advantages that T20 cannot replicate. It remains the ultimate test of a player's skill, technique, and mental strength. The format's complexity and depth create narratives and drama that shorter formats cannot match. Players consistently cite Test cricket as the pinnacle of their careers, and the World Test Championship has added context and meaning to bilateral series, creating a pathway to a definitive world champion.

Innovation offers hope for Test cricket's future. Day-night Tests have successfully attracted new audiences. The World Test Championship has made every series meaningful. Improved broadcasting, with enhanced graphics and analysis, makes the format more accessible to casual fans. Some propose further innovations - four-day Tests, more day-night matches, or condensed schedules - though purists resist changes to the traditional format.

The key to Test cricket's survival lies in finding the right balance. The format must evolve to remain relevant without losing the essential qualities that make it special. Cricket boards must ensure players are adequately compensated for Test cricket. Fans must continue supporting the format through attendance and viewership. If these elements align, Test cricket can coexist with T20 cricket, each format serving different purposes and audiences. The five-day format's 145-year history suggests it has the resilience to adapt and survive, continuing to provide cricket's ultimate examination for generations to come.`,
    published: true,
    aiGenerated: false,
    coverImage: ""
  }
];

const seedArticles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding articles...');

    let seeded = 0;
    
    for (const articleData of articles) {
      await Article.findOneAndUpdate(
        { slug: articleData.slug },
        articleData,
        { upsert: true, new: true }
      );
      seeded++;
    }

    console.log(`✓ Seeded ${seeded} articles`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding articles:', error);
    process.exit(1);
  }
};

seedArticles();
