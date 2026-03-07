import { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import * as THREE from 'three';
import venueService from '../services/venueService';
import matchService from '../services/matchService';

// Convert lat/lng to 3D coordinates
const toVector3 = (lat, lng, radius = 1.02) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// Venue Dot Component
function VenueDot({ venue, isSelected, isFiltered, onClick, onHover }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  const position = useMemo(() => {
    if (!venue.location?.coordinates) return [0, 0, 0];
    const [lng, lat] = venue.location.coordinates;
    const vec = toVector3(lat, lng, 1.03); // Slightly above globe surface
    return [vec.x, vec.y, vec.z];
  }, [venue]);

  useFrame((state) => {
    if (ringRef.current) {
      const time = state.clock.getElapsedTime();
      const offset = venue._id ? venue._id.charCodeAt(0) : 0;
      ringRef.current.scale.setScalar(1 + Math.sin(time * 2 + offset * 0.1) * 0.3);
      ringRef.current.material.opacity = 0.6 * (1 - Math.sin(time * 2 + offset * 0.1) * 0.5);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(venue);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setHovered(true);
    onHover(venue);
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    setHovered(false);
    onHover(null);
  };

  return (
    <group position={position}>
      {/* Outer ring pulse */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.015, 0.025, 16]} />
        <meshBasicMaterial color="#C9A84C" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Inner dot - clickable */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={isSelected ? 2 : hovered ? 1.5 : 1}
      >
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshBasicMaterial 
          color={isSelected ? '#FFD700' : hovered ? '#FFD700' : '#C9A84C'} 
          opacity={isFiltered ? 0.1 : 1}
          transparent
        />
      </mesh>

      {/* Hover label */}
      {hovered && !isSelected && (
        <Html position={[0, 0.05, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(10,10,15,0.95)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '11px',
            fontFamily: 'IBM Plex Mono, monospace',
            color: '#E8D5B0',
            whiteSpace: 'nowrap',
          }}>
            {venue.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// Globe Component
function Globe({ venues, selectedVenue, searchQuery, onVenueClick }) {
  const groupRef = useRef();
  const [hoveredVenue, setHoveredVenue] = useState(null);
  const textureRef = useRef();

  // Create Earth texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    // Using a simple procedural approach for Earth-like appearance
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create gradient for ocean
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a2332');
    gradient.addColorStop(0.5, '#0f1419');
    gradient.addColorStop(1, '#1a2332');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise for land masses
    ctx.fillStyle = 'rgba(40, 50, 45, 0.3)';
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 50 + 10;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    textureRef.current = texture;
  }, []);

  useFrame(() => {
    if (groupRef.current && !selectedVenue) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const filteredVenues = useMemo(() => {
    if (!searchQuery) return venues.map(v => ({ ...v, filtered: false }));
    const query = searchQuery.toLowerCase();
    return venues.map(v => ({
      ...v,
      filtered: !(
        v.name?.toLowerCase().includes(query) ||
        v.city?.toLowerCase().includes(query) ||
        v.country?.toLowerCase().includes(query)
      )
    }));
  }, [venues, searchQuery]);

  return (
    <group ref={groupRef}>
      {/* Main Globe sphere */}
      <mesh>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          color="#1a2838"
          map={textureRef.current}
          roughness={0.9}
          metalness={0.1}
          emissive="#0a0f14"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Continent outlines - more visible */}
      <mesh>
        <sphereGeometry args={[1.002, 64, 64]} />
        <meshBasicMaterial
          color="#C9A84C"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Atmosphere glow - inner */}
      <mesh>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshBasicMaterial
          color="#4a5f7f"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Atmosphere glow - outer */}
      <mesh>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshBasicMaterial
          color="#C9A84C"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Venue dots */}
      {filteredVenues.map((venue) => (
        <VenueDot
          key={venue._id}
          venue={venue}
          isSelected={selectedVenue?._id === venue._id}
          isFiltered={venue.filtered}
          onClick={onVenueClick}
          onHover={setHoveredVenue}
        />
      ))}
    </group>
  );
}

// Scene Component
function Scene({ venues, selectedVenue, searchQuery, onVenueClick }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#4a5f7f" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#C9A84C" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!selectedVenue}
        autoRotateSpeed={0.3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
      <Globe
        venues={venues}
        selectedVenue={selectedVenue}
        searchQuery={searchQuery}
        onVenueClick={onVenueClick}
      />
    </>
  );
}

function Venues() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [venueMatches, setVenueMatches] = useState([]);
  const [venueStats, setVenueStats] = useState(null);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchVenueMatches(selectedVenue._id);
    }
  }, [selectedVenue]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const results = venues.filter(v =>
        v.name?.toLowerCase().includes(query) ||
        v.city?.toLowerCase().includes(query) ||
        v.country?.toLowerCase().includes(query)
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, venues]);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const response = await venueService.getVenues();
      setVenues(response.data || []);
    } catch (err) {
      console.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const fetchVenueMatches = async (venueId) => {
    try {
      const response = await matchService.getMatches({ venue: venueId });
      const matches = response.data || [];
      setVenueMatches(matches.slice(0, 5));
      
      // Calculate stats
      const teamWins = {};
      matches.forEach(match => {
        if (match.winningTeam?.name) {
          teamWins[match.winningTeam.name] = (teamWins[match.winningTeam.name] || 0) + 1;
        }
      });
      
      const sortedTeams = Object.entries(teamWins)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);
      
      const others = Object.values(teamWins).reduce((sum, val) => sum + val, 0) -
        sortedTeams.reduce((sum, [, val]) => sum + val, 0);
      
      const pieData = [
        ...sortedTeams.map(([name, value]) => ({ name, value })),
        ...(others > 0 ? [{ name: 'Others', value: others }] : [])
      ];
      
      setVenueStats({ pieData, totalMatches: matches.length });
    } catch (err) {
      console.error('Failed to load venue matches');
    }
  };

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClose = () => {
    setSelectedVenue(null);
    setVenueMatches([]);
    setVenueStats(null);
  };

  const handleSearchResultClick = (venue) => {
    handleVenueClick(venue);
    setSearchFocused(false);
  };

  const getPitchBars = (venue) => {
    const profile = venue.pitchProfile || {};
    const spin = profile.spinFriendly || 0;
    const pace = profile.paceFriendly || 0;
    
    // Determine dominant characteristic
    if (spin > 60) {
      return [
        { label: 'SPIN FRIENDLY', value: 80 },
        { label: 'PACE FRIENDLY', value: 30 },
        { label: 'BATTING PARADISE', value: 50 }
      ];
    } else if (pace > 60) {
      return [
        { label: 'SPIN FRIENDLY', value: 30 },
        { label: 'PACE FRIENDLY', value: 80 },
        { label: 'BATTING PARADISE', value: 60 }
      ];
    } else {
      return [
        { label: 'SPIN FRIENDLY', value: 40 },
        { label: 'PACE FRIENDLY', value: 40 },
        { label: 'BATTING PARADISE', value: 90 }
      ];
    }
  };

  const getInningsAvgData = () => {
    if (!venueMatches.length) {
      // Return default data if no matches
      return [
        { innings: '1st Inn', avg: 0 },
        { innings: '2nd Inn', avg: 0 },
        { innings: '3rd Inn', avg: 0 },
        { innings: '4th Inn', avg: 0 },
      ];
    }
    
    const inningsData = { 1: [], 2: [], 3: [], 4: [] };
    
    venueMatches.forEach(match => {
      if (match.innings && Array.isArray(match.innings)) {
        match.innings.forEach(inn => {
          const inningsNum = inn.inningsNumber || inn.innings;
          const runs = inn.totalRuns || inn.total || inn.runs;
          if (inningsNum && runs && inningsNum >= 1 && inningsNum <= 4) {
            inningsData[inningsNum].push(runs);
          }
        });
      }
    });
    
    const result = [
      { 
        innings: '1st Inn', 
        avg: inningsData[1].length ? Math.round(inningsData[1].reduce((a, b) => a + b, 0) / inningsData[1].length) : 250 
      },
      { 
        innings: '2nd Inn', 
        avg: inningsData[2].length ? Math.round(inningsData[2].reduce((a, b) => a + b, 0) / inningsData[2].length) : 220 
      },
      { 
        innings: '3rd Inn', 
        avg: inningsData[3].length ? Math.round(inningsData[3].reduce((a, b) => a + b, 0) / inningsData[3].length) : 200 
      },
      { 
        innings: '4th Inn', 
        avg: inningsData[4].length ? Math.round(inningsData[4].reduce((a, b) => a + b, 0) / inningsData[4].length) : 180 
      },
    ];
    
    console.log('Innings data:', result);
    return result;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#0A0A0F' }}>
      {/* Top Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        background: 'linear-gradient(to bottom, rgba(10,10,15,0.8), transparent)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(232,213,176,0.5)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'color 0.3s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#E8D5B0'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(232,213,176,0.5)'}
        >
          ← The Covers
        </button>

        <span className="mono" style={{ fontSize: '11px', color: '#C9A84C', letterSpacing: '0.3em', fontWeight: 600 }}>
          {venues.length} TEST VENUES
        </span>

        {!selectedVenue ? (
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(10,10,15,0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '20px',
              padding: '8px 16px',
              width: searchFocused ? '280px' : '200px',
              transition: 'width 0.3s',
            }}>
              <Search size={14} color="rgba(232,213,176,0.5)" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#E8D5B0',
                  fontSize: '12px',
                  width: '100%',
                  fontFamily: 'Source Serif 4, serif',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s',
                    opacity: 0.6,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                >
                  <X size={14} color="#C9A84C" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && searchFocused && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'rgba(10,10,15,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: '12px',
                padding: '8px',
                minWidth: '280px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
              }}>
                {searchResults.map((venue) => (
                  <div
                    key={venue._id}
                    onClick={() => handleSearchResultClick(venue)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: '13px', color: '#E8D5B0', marginBottom: '2px' }}>
                      {venue.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(232,213,176,0.5)' }}>
                      {venue.city}, {venue.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.2)';
              e.currentTarget.style.borderColor = '#C9A84C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
            }}
          >
            <X size={20} color="#C9A84C" />
          </button>
        )}
      </div>

      {/* Globe Container */}
      <motion.div
        animate={{
          width: selectedVenue ? '50%' : '100%',
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        {!webglError ? (
          <Canvas
            camera={{ position: [0, 0, 2.8], fov: 50 }}
            style={{ background: '#0A0A0F' }}
            gl={{ 
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance'
            }}
            onCreated={({ gl }) => {
              try {
                gl.getContext();
              } catch (e) {
                console.error('WebGL error:', e);
                setWebglError(true);
              }
            }}
          >
            <Suspense fallback={null}>
              <Scene
                venues={venues}
                selectedVenue={selectedVenue}
                searchQuery={searchQuery}
                onVenueClick={handleVenueClick}
              />
            </Suspense>
          </Canvas>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0A0A0F',
            color: 'rgba(232,213,176,0.6)',
            fontSize: '14px',
            textAlign: 'center',
            padding: '40px',
          }}>
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏏</div>
              <div>WebGL is not supported in your browser.</div>
              <div style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(232,213,176,0.4)' }}>
                Please try a different browser or enable WebGL.
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Floating Bottom Card (default state only) */}
      <AnimatePresence>
        {!selectedVenue && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="float-animation"
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '80px',
              zIndex: 10,
              background: 'rgba(10,10,15,0.72)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px 32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div className="pulse-gold" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C' }} />
              <span className="mono" style={{ fontSize: '9px', color: '#C9A84C', letterSpacing: '0.2em', fontWeight: 600 }}>
                EXPLORE
              </span>
            </div>
            <div className="mono" style={{ fontSize: '64px', color: '#C9A84C', lineHeight: '1', fontWeight: 700, marginBottom: '8px' }}>
              {venues.length}
            </div>
            <div className="mono" style={{ fontSize: '9px', color: 'rgba(232,213,176,0.5)', letterSpacing: '0.2em', marginBottom: '4px' }}>
              TEST VENUES
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(232,213,176,0.6)' }}>
              Across {[...new Set(venues.map(v => v.country))].length} Countries
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Panel - Venue Details */}
      <AnimatePresence>
        {selectedVenue && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '50%',
              background: 'linear-gradient(to left, rgba(10,10,15,1) 0%, rgba(10,10,15,0.95) 100%)',
              overflowY: 'auto',
              padding: '80px 48px 48px',
              zIndex: 50,
              scrollbarWidth: 'thin',
              scrollbarColor: '#C9A84C rgba(255,255,255,0.05)',
            }}
          >
            {/* Venue Header */}
            <div style={{ marginBottom: '40px' }}>
              <div className="mono" style={{ fontSize: '10px', color: '#C9A84C', letterSpacing: '0.3em', marginBottom: '16px', fontWeight: 600 }}>
                VENUE
              </div>
              <h1 className="display" style={{ fontSize: '56px', lineHeight: '1.1', color: '#E8D5B0', fontWeight: 700, marginBottom: '12px' }}>
                {selectedVenue.name}
              </h1>
              <div style={{ fontSize: '16px', color: 'rgba(232,213,176,0.6)', marginBottom: '24px' }}>
                {selectedVenue.city}, {selectedVenue.country}
              </div>
              <div style={{ width: '60px', height: '2px', background: '#C9A84C' }} />
            </div>

            {/* Quick Stats Row */}
            <div style={{ display: 'flex', gap: '48px', marginBottom: '48px' }}>
              {selectedVenue.capacity && (
                <div>
                  <div className="mono" style={{ fontSize: '32px', color: '#C9A84C', lineHeight: '1', fontWeight: 700, marginBottom: '8px' }}>
                    {selectedVenue.capacity.toLocaleString()}
                  </div>
                  <div className="mono" style={{ fontSize: '9px', color: 'rgba(232,213,176,0.5)', letterSpacing: '0.1em' }}>
                    CAPACITY
                  </div>
                </div>
              )}
              <div style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }} />
              {selectedVenue.established && (
                <div>
                  <div className="mono" style={{ fontSize: '32px', color: '#C9A84C', lineHeight: '1', fontWeight: 700, marginBottom: '8px' }}>
                    {selectedVenue.established}
                  </div>
                  <div className="mono" style={{ fontSize: '9px', color: 'rgba(232,213,176,0.5)', letterSpacing: '0.1em' }}>
                    ESTABLISHED
                  </div>
                </div>
              )}
              <div style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }} />
              <div>
                <div className="mono" style={{ fontSize: '32px', color: '#C9A84C', lineHeight: '1', fontWeight: 700, marginBottom: '8px' }}>
                  {selectedVenue.matchesPlayed || 0}
                </div>
                <div className="mono" style={{ fontSize: '9px', color: 'rgba(232,213,176,0.5)', letterSpacing: '0.1em' }}>
                  MATCHES PLAYED
                </div>
              </div>
            </div>

            {/* Pitch Report */}
            <div style={{ marginBottom: '48px' }}>
              <div className="mono" style={{ fontSize: '9px', color: '#C9A84C', letterSpacing: '0.2em', marginBottom: '24px', fontWeight: 600 }}>
                PITCH REPORT
              </div>
              {getPitchBars(selectedVenue).map((bar, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,213,176,0.6)', letterSpacing: '0.1em' }}>
                      {bar.label}
                    </span>
                    <span className="mono" style={{ fontSize: '10px', color: '#C9A84C' }}>
                      {bar.value}%
                    </span>
                  </div>
                  <div style={{ position: 'relative', width: '100%', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.value}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        background: '#C9A84C',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Chart */}
            {venueStats && venueStats.pieData.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <div className="mono" style={{ fontSize: '9px', color: '#C9A84C', letterSpacing: '0.2em', marginBottom: '24px', fontWeight: 600 }}>
                  PERFORMANCE AT THIS VENUE
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      <Pie
                        data={venueStats.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        isAnimationActive={true}
                      >
                        {venueStats.pieData.map((entry, index) => {
                          const colors = ['#C9A84C', 'rgba(232,213,176,0.6)', 'rgba(232,213,176,0.4)', 'rgba(232,213,176,0.2)', 'rgba(255,255,255,0.1)'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(10,10,15,0.95)',
                          border: '1px solid rgba(201,168,76,0.3)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#E8D5B0',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                  {venueStats.pieData.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: ['#C9A84C', 'rgba(232,213,176,0.6)', 'rgba(232,213,176,0.4)', 'rgba(232,213,176,0.2)', 'rgba(255,255,255,0.1)'][index % 5]
                      }} />
                      <span style={{ fontSize: '11px', color: 'rgba(232,213,176,0.6)' }}>
                        {entry.name} ({Math.round((entry.value / venueStats.totalMatches) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Average Innings Scores */}
            <div style={{ marginBottom: '48px' }}>
              <div className="mono" style={{ fontSize: '9px', color: '#C9A84C', letterSpacing: '0.2em', marginBottom: '24px', fontWeight: 600 }}>
                AVERAGE INNINGS SCORES
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={getInningsAvgData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="innings"
                    tick={{ fill: 'rgba(232,213,176,0.6)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(232,213,176,0.6)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,10,15,0.95)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#E8D5B0',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(201,168,76,0.1)' }}
                  />
                  <Bar
                    dataKey="avg"
                    fill="#C9A84C"
                    isAnimationActive={true}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              {venueMatches.length === 0 && (
                <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(232,213,176,0.4)', marginTop: '8px' }}>
                  Showing typical Test match averages
                </div>
              )}
            </div>

            {/* Recent Matches */}
            {venueMatches.length > 0 && (
              <div>
                <div className="mono" style={{ fontSize: '9px', color: '#C9A84C', letterSpacing: '0.2em', marginBottom: '24px', fontWeight: 600 }}>
                  RECENT MATCHES
                </div>
                {venueMatches.map((match, index) => (
                  <div
                    key={match._id || index}
                    style={{
                      paddingBottom: '16px',
                      marginBottom: '16px',
                      borderBottom: index < venueMatches.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <div className="mono" style={{ fontSize: '10px', color: 'rgba(232,213,176,0.5)', marginBottom: '6px' }}>
                      {match.startDate ? new Date(match.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#E8D5B0', marginBottom: '4px', fontFamily: 'Source Serif 4, serif' }}>
                      {match.team1?.name || 'Team 1'} vs {match.team2?.name || 'Team 2'}
                    </div>
                    {match.winningTeam && (
                      <div style={{ fontSize: '12px', color: '#C9A84C' }}>
                        {match.winningTeam.name} won
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 200,
          textAlign: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(201,168,76,0.2)',
            borderTop: '3px solid #C9A84C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ fontSize: '13px', color: 'rgba(232,213,176,0.6)' }}>
            Loading venues...
          </div>
        </div>
      )}
    </div>
  );
}

export default Venues;
