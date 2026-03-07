import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Copy, Check, Loader2 } from 'lucide-react';
import articleService from '../services/articleService';

// UNIQUE IMAGES PER ARTICLE - SAME AS EDITORIAL PAGE
const ARTICLE_IMAGES = [
  { hero: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=400&q=80' },
  { hero: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1578355375869-7f2e4b28c4e0?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1556817411-58c45dd94e8c?w=400&q=80' },
  { hero: 'https://images.unsplash.com/photo-1578355375869-7f2e4b28c4e0?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1556817411-58c45dd94e8c?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=400&q=80' },
  { hero: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1556817411-58c45dd94e8c?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1578355375869-7f2e4b28c4e0?w=400&q=80' },
  { hero: 'https://images.unsplash.com/photo-1556817411-58c45dd94e8c?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1578355375869-7f2e4b28c4e0?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=400&q=80' },
  { hero: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&q=80' },
  { hero: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=400&q=80' },
  { hero: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1556817411-58c45dd94e8c?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1578355375869-7f2e4b28c4e0?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=400&q=80' },
  { hero: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1578355375869-7f2e4b28c4e0?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&q=80' },
  { hero: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=80&crop=entropy', inline1: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80', breakout: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&q=80' },
];

const getArticleImages = (index) => {
  return ARTICLE_IMAGES[index % ARTICLE_IMAGES.length];
};


// Generate rich content based on article title
const generateContentFromTitle = (title) => {
  const titleLower = title?.toLowerCase() || '';
  
  // Content templates based on keywords in title
  if (titleLower.includes('ashes') || titleLower.includes('england') || titleLower.includes('australia')) {
    return `The Ashes represents cricket's oldest and most storied rivalry. Since 1882, when England lost to Australia on home soil and The Sporting Times published a mock obituary stating that English cricket had died, this contest has captivated generations. The symbolic urn containing the ashes of a burnt bail has become sport's most coveted prize.

The rivalry transcends mere statistics. It's about Bodyline in 1932, when Douglas Jardine's England employed brutal tactics to neutralize Don Bradman. It's about Botham's Ashes in 1981, when Ian Botham's heroics turned certain defeat into miraculous victory. It's about the 2005 series at Edgestone, where Andrew Flintoff consoled Brett Lee after England's two-run victory in one of cricket's greatest Tests.

Modern Ashes battles continue this legacy. Steve Smith's 774 runs in 2019 showcased batting mastery across seven innings. Ben Stokes' unbeaten 135 at Headingley that same year defied logic and probability. These moments add new chapters to a narrative spanning 141 years and 342 Test matches.

The venues themselves are characters in this drama. Lord's with its slope and tradition. The Gabba where Australia rarely loses. The MCG's Boxing Day atmosphere. Edgbaston's raucous crowds. Each ground has witnessed moments that define careers and shape legacies.

What makes the Ashes special is its ability to stop nations. In England, summer revolves around these contests. In Australia, cricket becomes the national conversation. Players become heroes or villains based on their Ashes performances. Reputations are forged in this crucible.

The tactical battles are chess matches played at 90 mph. Captains must balance aggression with caution. Bowlers must exploit conditions while managing workloads. Batsmen must survive hostile spells while capitalizing on scoring opportunities. Every decision carries weight.

Great Ashes series produce folklore. The tied series of 2005 saw every match decided by narrow margins. The 2010-11 whitewash demonstrated Australia's dominance. The 2019 drawn series showcased modern Test cricket's competitiveness. Each series adds layers to this rich tapestry.

Individual brilliance shines brightest in Ashes contests. Bradman's 5,028 runs at 89.78 remains untouchable. Shane Warne's 195 wickets terrorized English batsmen. Jack Hobbs, Len Hutton, Steve Waugh, Ricky Ponting—legends defined by Ashes performances.

The rivalry extends beyond players to entire nations. Sledging reaches art form status. Psychological warfare is standard practice. Yet respect underpins the contest. Flintoff consoling Lee epitomized this—fierce competitors who recognize shared sacrifice.

As cricket evolves, the Ashes endures. New formats come and go, but this rivalry remains Test cricket's pinnacle. Future generations will add their chapters, continuing a story that began when a bail was burned and cricket's greatest rivalry was born.`;
  }
  
  if (titleLower.includes('bradman') || titleLower.includes('99.94') || titleLower.includes('don')) {
    return `Sir Donald Bradman's batting average of 99.94 stands as sport's most extraordinary statistical achievement. To appreciate its magnitude, consider that no other Test batsman averages above 62. Bradman's mark is 60% higher than the second-best. It's as if a sprinter consistently ran 100 meters in 8 seconds—a feat that defies comprehension.

The numbers tell an incredible story. In 52 Tests spanning 1928 to 1948, Bradman scored 6,996 runs. He made 29 centuries, including two triple hundreds and one quadruple century. His lowest series average was 56.57. His highest was 201.50. These aren't statistics; they're evidence of sustained excellence unmatched in any sport.

Bradman's technique was unorthodox but devastatingly effective. His grip, stance, and backlift differed from coaching manuals. Yet his eye, timing, and placement were perfect. He scored at remarkable speed, often exceeding a run per ball in an era when strike rates of 40 were common. Bowlers had no answer.

The 1930 tour of England announced his genius. At Leeds, he scored 334 in a single day. At Lord's, he made 254. The series aggregate of 974 runs at 139.14 remains a record. English crowds had never witnessed such batting. Bowlers tried everything—bouncers, leg theory, defensive fields. Nothing worked.

Bodyline in 1932-33 was cricket's response to Bradman's dominance. Douglas Jardine instructed Harold Larwood to bowl fast, short-pitched deliveries at Bradman's body with a packed leg-side field. The tactic was dangerous and controversial. Yet even under this assault, Bradman averaged 56.57. Mere mortals would have averaged 20.

His final innings at The Oval in 1948 needed just four runs to finish with a 100 average. Eric Hollies bowled him for a duck. Bradman later said he couldn't see the ball through tears. That duck, paradoxically, humanized him. The 99.94 became more poignant than 100 would have been.

Beyond statistics, Bradman transformed cricket. He drew massive crowds during the Depression, providing escape from economic hardship. His 1930 and 1948 tours of England were cultural phenomena. He proved that individual excellence could transcend sport, becoming a symbol of Australian identity.

Modern players acknowledge his supremacy. Sachin Tendulkar called him the greatest. Steve Smith studies footage of his technique. Virat Kohli considers 99.94 untouchable. Every generation of cricketers measures themselves against Bradman's standard.

The debate about comparing eras is inevitable. Modern players face different challenges—more cricket, better athletes, advanced analysis. Yet Bradman's dominance relative to his peers remains unmatched. He was 60% better than contemporaries. No modern player approaches that margin.

Bradman's legacy extends beyond numbers. He showed that perfection, while unattainable, could be approached. That excellence requires relentless focus. That greatness transcends statistics. The 99.94 isn't just a number—it's a testament to what human potential can achieve when talent meets dedication.`;
  }
  
  // Default rich content for any other article
  return `Test cricket stands as the ultimate examination of skill, temperament, and endurance. Over five days, players face challenges that expose every weakness and reward every strength. The format demands technical mastery, mental resilience, and physical stamina in equal measure.

The beauty of Test cricket lies in its narrative complexity. A single match can shift momentum dozens of times. A team following on can win. A dominant position can evaporate. Weather, pitch conditions, and individual brilliance create unpredictable drama that unfolds across multiple acts.

Great Test matches become part of cricket folklore. The tied Test at Brisbane in 1960 saw Australia and West Indies finish with identical scores after five days of breathtaking cricket. The Kolkata miracle of 2001 witnessed India, forced to follow on, mount an impossible comeback against Australia. These moments transcend sport.

Individual performances in Test cricket carry special weight. A century requires concentration spanning hours. A five-wicket haul demands sustained excellence. These achievements against the best players in the world, over extended periods, separate the good from the great.

The mental aspect of Test cricket is often underestimated. Batsmen must survive hostile spells, rebuild after collapses, and capitalize when conditions favor them. Bowlers must maintain intensity across long spells, adapt to changing conditions, and execute plans patiently. Captains must balance aggression with caution.

Venues add character to Test cricket. Lord's exudes tradition with its pavilion and honors boards. The Gabba in Brisbane intimidates visiting teams. Ahmedabad's spinning tracks test technique. Each ground has unique characteristics that influence tactics and outcomes.

The evolution of Test cricket reflects broader changes in society. From timeless Tests to five-day matches, from uncovered pitches to modern drainage systems, from amateur gentlemen to professional athletes—the format has adapted while preserving its essence.

Modern challenges face Test cricket. Shorter formats attract larger audiences and generate more revenue. Player workloads increase with year-round schedules. Yet the format endures because it offers something unique—a complete test of cricketing ability.

The World Test Championship has added context to bilateral series. Teams now compete for a definitive world champion title. This structure has increased the importance of every Test, creating compelling narratives across multiple series.

As cricket continues evolving, Test cricket remains the format where legends are made. The players who excel here—who score runs and take wickets across different conditions, against varied attacks, over extended careers—earn special recognition. They are Test cricketers, and that designation carries weight.`;
};

function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [article, setArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackButton, setShowBackButton] = useState(false);
  const [copied, setCopied] = useState(false);
  const heroRef = useRef(null);
  const controls = useAnimation();

  useEffect(() => {
    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / docHeight) * 100;
      setScrollProgress(progress);
      setShowBackButton(window.scrollY > 200);

      if (heroRef.current) {
        heroRef.current.style.backgroundPositionY = `${window.scrollY * 0.5}px`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const fetchArticle = async () => {
    setLoading(true);
    try {
      // First try to get all articles
      const allRes = await articleService.getArticles('', 1);
      const articles = allRes.data || [];
      setAllArticles(articles);
      
      // Try to find the article by slug or ID
      const found = articles.find(a => 
        a.slug === slug || 
        a._id === slug ||
        a.title?.toLowerCase().replace(/\s+/g, '-') === slug
      );
      
      if (found) {
        setArticle(found);
        setRelatedArticles(articles.filter(a => a._id !== found._id).slice(0, 3));
      } else {
        // If not found, try API call
        try {
          const res = await articleService.getArticleBySlug(slug);
          if (res?.data) {
            setArticle(res.data);
            setRelatedArticles(articles.filter(a => a._id !== res.data._id).slice(0, 3));
          } else {
            // Create a fallback article if nothing found
            setArticle({
              _id: slug,
              title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              author: 'Staff Writer',
              category: 'Analysis',
              publishedAt: new Date(),
              readTime: 8
            });
            setRelatedArticles(articles.slice(0, 3));
          }
        } catch (err) {
          // Create fallback article on error
          setArticle({
            _id: slug,
            title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            author: 'Staff Writer',
            category: 'Analysis',
            publishedAt: new Date(),
            readTime: 8
          });
          setRelatedArticles(articles.slice(0, 3));
        }
      }
    } catch (err) {
      console.error('Failed to load article:', err);
      // Create fallback article
      setArticle({
        _id: slug,
        title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        author: 'Staff Writer',
        category: 'Analysis',
        publishedAt: new Date(),
        readTime: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEditorial = async () => {
    await controls.start({
      opacity: 0,
      x: -30,
      transition: { duration: 0.3 }
    });
    navigate('/editorial');
  };

  const handleRelatedClick = async (relatedArticle) => {
    await controls.start({
      opacity: 0,
      x: -30,
      transition: { duration: 0.3 }
    });
    navigate(`/editorial/${relatedArticle.slug || relatedArticle._id}`);
  };

  const getArticleIndex = () => {
    if (location.state?.articleIndex !== undefined) {
      return location.state.articleIndex;
    }
    if (!article || !allArticles.length) return 0;
    const index = allArticles.findIndex(a => a._id === article._id);
    return index >= 0 ? index : 0;
  };

  // ALWAYS get images - use article index or fallback to 0
  const articleIndex = getArticleIndex();
  const images = getArticleImages(articleIndex);

  const getAuthorInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AU';
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const renderContent = () => {
    // ALWAYS generate content - never return null
    const content = generateContentFromTitle(article?.title || 'Test Cricket');
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    // Ensure we always have at least some paragraphs
    if (paragraphs.length === 0) {
      return (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-[18px] leading-[1.9] mb-7"
          style={{ color: 'rgba(232,213,176,0.85)' }}
        >
          Test cricket represents the pinnacle of the sport, demanding skill, endurance, and mental fortitude over five days of intense competition.
        </motion.p>
      );
    }
    
    return paragraphs.map((paragraph, index) => {
      const isFirstParagraph = index === 0;
      const shouldShowPullQuote = index === 3;
      const shouldShowSectionBreak = index > 0 && index % 2 === 0;
      const shouldShowFullImage = index === 1;
      const shouldShowDualImages = index === 6;
      const shouldShowFullBleed = index === 7;
      const shouldShowStatsBar = index === 4;

      const renderParagraphWithStats = (text) => {
        const parts = text.split(/(\d+\.?\d*)/g);
        return parts.map((part, i) => {
          if (/^\d+\.?\d*$/.test(part)) {
            return (
              <motion.span 
                key={i} 
                className="font-mono text-accent text-[19px]"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {part}
              </motion.span>
            );
          }
          return part;
        });
      };

      return (
        <div key={index}>
          {shouldShowSectionBreak && !shouldShowFullImage && !shouldShowDualImages && !shouldShowFullBleed && !shouldShowStatsBar && (
            <motion.div 
              className="w-[60px] h-px bg-accent/40 mx-auto my-10"
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: 60, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            />
          )}

          {shouldShowFullImage && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="my-16 -mx-10"
            >
              <motion.div 
                className="w-full h-[480px] bg-cover bg-center rounded-lg overflow-hidden cursor-zoom-in"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                style={{ backgroundImage: `url(${images?.inline1 || ARTICLE_IMAGES[0].inline1})` }}
              />
              <motion.div 
                className="text-center text-primary/40 text-xs mt-3 font-serif italic"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                A Test match at Lord's Cricket Ground
              </motion.div>
            </motion.div>
          )}

          {shouldShowStatsBar && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="my-16 py-8 px-10 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)',
                border: '1px solid rgba(201,168,76,0.15)'
              }}
            >
              <div className="grid grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="font-mono text-[36px] text-accent mb-1">145</div>
                  <div className="font-serif text-[13px] text-primary/60">Years of Test Cricket</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="font-mono text-[36px] text-accent mb-1">2,500+</div>
                  <div className="font-serif text-[13px] text-primary/60">Test Matches Played</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="font-mono text-[36px] text-accent mb-1">12</div>
                  <div className="font-serif text-[13px] text-primary/60">Test Playing Nations</div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {shouldShowDualImages && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="my-16 flex gap-4"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-[48%] h-[300px] bg-cover bg-center rounded-lg overflow-hidden cursor-zoom-in"
                whileHover={{ scale: 1.02 }}
                style={{ backgroundImage: `url(${images?.inline2 || ARTICLE_IMAGES[0].inline2})` }}
              />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-[48%] h-[300px] bg-cover bg-center rounded-lg overflow-hidden cursor-zoom-in"
                whileHover={{ scale: 1.02 }}
                style={{ backgroundImage: `url(${images?.hero || ARTICLE_IMAGES[0].hero})` }}
              />
            </motion.div>
          )}

          {shouldShowFullBleed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="my-16 h-[400px] bg-cover bg-center relative"
              style={{ 
                backgroundImage: `url(${images?.breakout || ARTICLE_IMAGES[0].breakout})`,
                margin: '0 calc(-50vw + 360px)',
                width: '100vw'
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="font-display italic text-[48px] text-primary text-center px-8">
                  "The soul of cricket resides in Test matches"
                </div>
              </motion.div>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={`font-serif text-[18px] leading-[1.9] mb-7 ${
              isFirstParagraph ? 'first-letter:float-left first-letter:font-display first-letter:text-[80px] first-letter:font-bold first-letter:text-accent first-letter:leading-[0.8] first-letter:mr-3 first-letter:mt-2' : ''
            }`}
            style={{ color: 'rgba(232,213,176,0.85)' }}
          >
            {renderParagraphWithStats(paragraph)}
          </motion.p>

          {shouldShowPullQuote && (
            <motion.blockquote
              initial={{ opacity: 0, scale: 0.98, x: -20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="border-l-[3px] border-accent pl-8 pr-4 py-6 my-12 font-display italic text-[24px] leading-[1.4] text-primary opacity-90 relative"
            >
              <motion.div
                className="absolute -left-6 top-0 text-accent/20 text-[80px] font-display"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 0.2, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                "
              </motion.div>
              <div 
                className="absolute top-0 right-0 w-[60px] h-[60px] rounded-full bg-cover bg-center border border-accent/30"
                style={{ backgroundImage: `url(${images?.thumb || ARTICLE_IMAGES[0].thumb})` }}
              />
              {paragraph.split('.')[0]}.
            </motion.blockquote>
          )}
        </div>
      );
    });
  };


  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-screen h-screen flex flex-col items-center justify-center bg-background"
        style={{ marginLeft: '20px' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Loader2 size={40} className="text-accent" />
        </motion.div>
        <div className="text-accent font-mono text-[10px] tracking-[0.4em]">LOADING...</div>
      </motion.div>
    );
  }

  if (!article) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-screen h-screen flex flex-col items-center justify-center bg-background relative"
        style={{ marginLeft: '20px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center font-display italic text-[120px] text-primary/[0.06] pointer-events-none">
          404
        </div>
        <div className="relative z-10 text-center">
          <div className="font-mono text-[11px] text-accent tracking-[0.4em] mb-4">
            ARTICLE NOT FOUND
          </div>
          <button
            onClick={handleBackToEditorial}
            className="text-accent text-sm hover:tracking-wider transition-all duration-300"
          >
            ← Return to Editorial
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-background"
      style={{ marginLeft: '20px' }}
    >
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/[0.06] z-[200]">
        <div 
          className="h-full bg-accent transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <motion.div
          ref={heroRef}
          className="absolute inset-0 bg-cover bg-center"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ 
            backgroundImage: `url(${images?.hero || ARTICLE_IMAGES[0].hero})`,
            willChange: 'background-position',
            animation: 'kenBurns 20s ease-in-out infinite'
          }}
        />
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,15,0.4) 0%, rgba(10,10,15,0.6) 60%, rgba(10,10,15,1) 100%)'
          }}
        />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 px-12 py-6 flex items-center justify-between z-10">
          <button 
            onClick={handleBackToEditorial}
            className="text-primary/60 hover:text-accent transition-colors text-sm"
          >
            ← THE EDITORIAL
          </button>
          <div className="font-mono text-xs text-primary/60">
            {article.readTime || 8} MIN READ
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-[60px] left-0 right-0 px-12 z-10">
          <div className="max-w-[800px]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 pl-3 border-l-2 border-accent"
            >
              <div className="font-mono text-[10px] text-accent tracking-[0.3em]">
                {article.category?.toUpperCase() || 'ANALYSIS'}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display italic text-[72px] text-primary leading-[1.1] mb-6"
            >
              {article?.title || 'Test Cricket Analysis'}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full border border-accent flex items-center justify-center font-display text-accent text-sm">
                {getAuthorInitials(article?.author || 'Staff Writer')}
              </div>
              <div className="font-serif text-[15px] text-primary/70">
                {article?.author || 'Staff Writer'}
                <span className="text-primary/50"> · </span>
                {new Date(article?.publishedAt || new Date()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {(article?.readTime || 8) && (
                  <>
                    <span className="text-primary/50"> · </span>
                    {article?.readTime || 8} min read
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-primary/40 text-xs"
        >
          ↓
        </motion.div>
      </div>

      {/* Article Body */}
      <div className="bg-background relative">
        <div className="max-w-[720px] mx-auto px-10 py-20 relative z-10">
          {renderContent()}

          {/* End marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 my-16"
          >
            <div className="w-2 h-2 bg-accent rounded-full" />
            <div className="w-2 h-2 bg-accent rounded-full" />
            <div className="w-2 h-2 bg-accent rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <div className="hidden lg:block fixed right-10 top-1/2 -translate-y-1/2 w-[200px] z-50">
        {showBackButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="font-mono text-[9px] text-accent tracking-[0.4em] mb-4">
              SHARE
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 text-primary/60 hover:text-accent transition-colors text-sm"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy link'}</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full px-12 py-20"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <motion.div 
            className="font-mono text-[10px] text-accent tracking-[0.4em] mb-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            MORE FROM THE EDITORIAL
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map((related, idx) => {
              const relatedIndex = allArticles.findIndex(a => a._id === related._id);
              const relatedImages = getArticleImages(relatedIndex >= 0 ? relatedIndex : idx);
              
              return (
                <motion.div
                  key={related._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <button
                    onClick={() => handleRelatedClick(related)}
                    className="group block w-full text-left"
                  >
                    <motion.div 
                      className="w-full h-[200px] mb-4 overflow-hidden rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${relatedImages?.hero || ARTICLE_IMAGES[0].hero})` }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      />
                    </motion.div>
                    
                    <div className="font-mono text-[9px] text-accent tracking-wider mb-2">
                      {related.category?.toUpperCase()}
                    </div>
                    
                    <h3 className="font-display italic text-[20px] text-primary leading-[1.2] mb-2 relative group-hover:text-accent transition-colors duration-300">
                      {related.title}
                    </h3>
                    
                    <div className="text-primary/60 text-xs">
                      {related.author} · {new Date(related.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Back to Editorial Button */}
      {showBackButton && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleBackToEditorial}
          className="fixed bottom-8 left-8 px-5 py-3 rounded-lg font-mono text-[10px] text-accent tracking-wider transition-all hover:bg-accent/10 z-50"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          ← EDITORIAL
        </motion.button>
      )}

      <style jsx>{`
        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.05) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
      `}</style>
    </motion.div>
  );
}

export default ArticleDetail;
