import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from '../components/GameCard';
import { AddGameForm } from '../components/AddGameForm';
import '../styles/pages/games.css';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const FILTERS = [
    {
        label: 'Genre',
        options: [
            'Action', 'Adventure', 'RPG', 'Shooter',
            'Strategy', 'Sports', 'Simulation', 'Horror',
        ],
    },
    {
        label: 'Release',
        options: ['2026', '2025', '2024', '2023', '2022', 'Earlier'],
    },
    {
        label: 'Platform',
        options: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'],
    },
    {
        label: 'Score',
        options: ['9+', '8+', '7+', '6+', 'Under 6'],
    },
];

export const Games = () => {
    const navigate = useNavigate();

    /* ── State ── */
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({});

    /* ── Fetch games on mount ── */
    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`${VITE_BACKEND_URL}/api/games`)
            .then((res) => {
                if (!res.ok) throw new Error(`Error ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setGames(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    /* ── Accent-insensitive search ── */
    const normalize = (s) =>
        (s || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

    /* ── Toggle filter option ── */
    const toggleFilter = (filterLabel, option) => {
        setSelectedFilters(prev => {
            const current = prev[filterLabel] || [];
            const updated = current.includes(option)
                ? current.filter(o => o !== option)
                : [...current, option];
            return { ...prev, [filterLabel]: updated };
        });
    };

    /* ── Filtered games: search + all active filters ── */
    const filteredGames = games.filter((game) => {
        // Search by title
        if (searchTerm.trim()) {
            const term = normalize(searchTerm);
            if (!normalize(game.title).includes(term)) return false;
        }

        // Genre filter
        const selGenres = selectedFilters['Genre'] || [];
        if (selGenres.length > 0) {
            if (!game.genres?.some(g => selGenres.includes(g))) return false;
        }

        // Release filter
        const selReleases = selectedFilters['Release'] || [];
        if (selReleases.length > 0) {
            const gameYear = game.release_date
                ? new Date(game.release_date).getFullYear().toString()
                : null;
            const matchesRelease = selReleases.some(r => {
                if (r === 'Earlier') return gameYear && parseInt(gameYear) < 2022;
                return gameYear === r;
            });
            if (!matchesRelease) return false;
        }

        // Platform filter (partial match — "PlayStation" matchea "PlayStation 5")
        const selPlatforms = selectedFilters['Platform'] || [];
        if (selPlatforms.length > 0) {
            const matchesPlatform = game.platforms?.some(p =>
                selPlatforms.some(sp => p.toLowerCase().includes(sp.toLowerCase()))
            );
            if (!matchesPlatform) return false;
        }

        // Score filter
        const selScores = selectedFilters['Score'] || [];
        if (selScores.length > 0) {
            const rating = game.game_tier?.average_rating;
            const matchesScore = selScores.some(s => {
                if (s === '9+') return rating >= 9;
                if (s === '8+') return rating >= 8;
                if (s === '7+') return rating >= 7;
                if (s === '6+') return rating >= 6;
                if (s === 'Under 6') return rating != null && rating < 6;
                return false;
            });
            if (!matchesScore) return false;
        }

        return true;
    });

    /* ── Modal close handler ── */
    const handleCloseForm = () => {
        setShowForm(false);
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCloseForm();
        }
    };

    /* ══════════════════════════════════════
       LOADING STATE
       ══════════════════════════════════════ */
    if (loading) {
        return (
            <div className="gs-page-bg">
                <div className="games-page gs-page-content">
                    <div className="games-loading">
                        <div
                            className="spinner-border text-light"
                            role="status"
                            style={{ width: '3rem', height: '3rem' }}
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ══════════════════════════════════════
       ERROR STATE
       ══════════════════════════════════════ */
    if (error) {
        return (
            <div className="gs-page-bg">
                <div className="games-page gs-page-content">
                    <div className="games-error">
                        <h2>Something went wrong</h2>
                        <p className="mt-2">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    /* ══════════════════════════════════════
       CONTENT STATE
       ══════════════════════════════════════ */
    return (
        <div className="gs-page-bg">
            <div className="games-page gs-page-content">
                {/* ── Header ── */}
                <div className="games-header mb-5">
                    <h1 className="games-title gs-graffiti-title">Game Library</h1>
                    <p className="games-subtitle">
                        Browse, filter, and discover your next favorite game
                    </p>
                </div>

                {/* ── Search Input ── */}
                <div className="mb-4">
                    <input
                        className="games-search"
                        type="text"
                        placeholder="Search games..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* ── Filter Buttons ── */}
                <div className="games-filters mb-4">
                    {FILTERS.map((filter) => {
                        const activeCount = (selectedFilters[filter.label] || []).length;
                        return (
                            <div key={filter.label} style={{ position: 'relative' }}>
                                <button
                                    type="button"
                                    className={
                                        'games-filter-btn' +
                                        (openDropdown === filter.label ? ' active' : '') +
                                        (activeCount > 0 ? ' has-selection' : '')
                                    }
                                    onClick={() =>
                                        setOpenDropdown(
                                            openDropdown === filter.label ? null : filter.label
                                        )
                                    }
                            >
                                <span className="games-filter-btn__label">
                                    {activeCount > 0 && (
                                        <span className="games-filter-btn__badge">{activeCount}</span>
                                    )}
                                    {filter.label}
                                </span>
                                <span
                                        className={
                                            'games-filter-btn__arrow' +
                                            (openDropdown === filter.label ? ' open' : '')
                                        }
                                    >
                                        ▼
                                    </span>
                                </button>

                                {openDropdown === filter.label && (
                                    <div className="games-filter-dropdown">
                                        {filter.options.map((option) => {
                                            const isSelected = (selectedFilters[filter.label] || []).includes(option);
                                            return (
                                                <div
                                                    key={option}
                                                    className={
                                                        'games-filter-option' +
                                                        (isSelected ? ' selected' : '')
                                                    }
                                                    onClick={() => toggleFilter(filter.label, option)}
                                                >
                                                    {option}
                                                    {isSelected && <span className="games-filter-option__check">✓</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Game Grid or Empty State ── */}
                {filteredGames.length > 0 ? (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
                        {filteredGames.map((game) => (
                            <div key={game.id} className="col">
                                <GameCard game={game} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="games-empty">
                        <h2 className="games-empty__title">
                            Oops... this game does not exist here yet
                        </h2>
                        <p className="games-empty__subtitle">
                            {searchTerm || Object.keys(selectedFilters).some(k => selectedFilters[k].length)
                                ? 'No games match your search or filters.'
                                : 'Be the first to suggest it and help us grow the Game-Side library.'
                            }
                        </p>
                        <button
                            className="games-empty__btn"
                            onClick={() => setShowForm(true)}
                        >
                            Suggest Adding Game
                        </button>
                    </div>
                )}
            </div>

            {/* ── AddGameForm Modal ── */}
            {showForm && (
                <div className="gs-modal-backdrop" onClick={handleBackdropClick}>
                    <div className="gs-modal gs-modal--form">
                        <AddGameForm
                            initialTitle={searchTerm}
                            onClose={handleCloseForm}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
