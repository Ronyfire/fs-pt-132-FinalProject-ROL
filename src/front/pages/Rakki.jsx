import React from "react";
import { Link } from "react-router-dom";
import RakkiTest from "../assets/img/RakkiTEST.png";

export const Rakki = () => {
    const profileFacts = [
        {
            label: "Full Name",
            value: "Rakki",
            detail: "The punk-gamer raccoon of Game-Side."
        },
        {
            label: "Role",
            value: "Game-Side Tracker",
            detail: "Tracks games, ratings, hidden gems, and suspiciously good recommendations."
        },
        {
            label: "Favorite Color",
            value: "Hot Pink",
            detail: "Mostly because it looks amazing as graffiti."
        },
        {
            label: "Favorite Game",
            value: "Cyberpunk 2077",
            detail: "Neon lights, chaotic streets, stylish jackets. Rakki approves."
        },
        {
            label: "Favorite Villain",
            value: "The Joker",
            detail: "The color palette is dramatic, dangerous, and extremely on brand."
        },
        {
            label: "Favorite Genre",
            value: "RPG / Action Adventure",
            detail: "Rakki loves choices, upgrades, exploration, and causing a little trouble."
        },
        {
            label: "Favorite Snack",
            value: "Energy drinks & arcade nachos",
            detail: "Not recommended as a balanced diet, but very recommended for late-night gaming."
        },
        {
            label: "Special Skill",
            value: "Finding hidden gems",
            detail: "If a game is underrated, Rakki probably already knows about it."
        }
    ];

    const rakkiMoods = [
        {
            title: "Helpful",
            text: "Guides players through surveys, recommendations, and empty libraries."
        },
        {
            title: "Chaotic",
            text: "May or may not spray-paint pink arrows around important buttons."
        },
        {
            title: "Curious",
            text: "Always checking what players are rating, saving, and discovering."
        },
        {
            title: "Loyal",
            text: "Once Rakki joins your backlog, he never truly leaves."
        }
    ];

    return (
        <main className="gs-rakki-page">
            <section className="container gs-rakki-hero">
                <div className="gs-rakki-hero-content">
                    <span className="gs-rakki-kicker">Secret mascot file unlocked</span>

                    <h1 className="gs-rakki-title">
                        Meet <span>Rakki</span>
                    </h1>

                    <p className="gs-rakki-description">
                        You found Rakki&apos;s hideout. Don&apos;t tell the navbar.
                    </p>

                    <p className="gs-rakki-description gs-rakki-description-secondary">
                        This neon-loving little chaos gremlin tracks hidden gems, messy backlogs,
                        and suspiciously good recommendations from the secret side of Game-Side.
                    </p>

                    <div className="gs-rakki-actions">
                        <Link to="/survey" className="btn-gs btn-green">
                            Get Rakki&apos;s Recommendations
                        </Link>

                        <Link to="/games" className="btn-gs btn-green-outline">
                            Explore Games
                        </Link>
                    </div>
                </div>

                <aside className="gs-rakki-card">
                    <div className="gs-rakki-image-box">
                        <img src={RakkiTest} alt="Rakki, Game-Side mascot" />
                    </div>

                    <div className="gs-rakki-card-info">
                        <h2>Rakki</h2>
                        <p>Punk raccoon · Game tracker · Backlog gremlin</p>
                    </div>
                </aside>
            </section>

            <section className="container gs-rakki-section">
                <div className="gs-rakki-section-header">
                    <span className="gs-rakki-kicker">Official profile</span>

                    <h2>
                        Rakki&apos;s <span>Character Sheet</span>
                    </h2>
                </div>

                <div className="gs-rakki-facts-grid">
                    {profileFacts.map((fact) => (
                        <article className="gs-rakki-fact-card" key={fact.label}>
                            <span>{fact.label}</span>
                            <h3>{fact.value}</h3>
                            <p>{fact.detail}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="container gs-rakki-section">
                <div className="gs-rakki-lore-card">
                    <div>
                        <span className="gs-rakki-kicker">Mascot lore</span>

                        <h2>
                            A tiny raccoon with a very serious mission.
                        </h2>

                        <p>
                            Rakki lives somewhere between your backlog, your wishlist, and the
                            weird corner of the internet where people argue about tier lists.
                            He loves neon stickers, dramatic villains, stylish games, and
                            helping players find something actually worth playing.
                        </p>

                        <p>
                            Around Game-Side, Rakki appears whenever you need a hand: when
                            recommendations are loading, when a search finds nothing, when your
                            library is empty, or when a page gets lost in the digital alleyways.
                        </p>
                    </div>

                    <div className="gs-rakki-graffiti-box">
                        <strong>Track.</strong>
                        <strong>Rate.</strong>
                        <strong>Discover.</strong>
                    </div>
                </div>
            </section>

            <section className="container gs-rakki-section pb-5">
                <div className="gs-rakki-section-header">
                    <span className="gs-rakki-kicker">Personality</span>

                    <h2>
                        Rakki&apos;s <span>Mood Board</span>
                    </h2>
                </div>

                <div className="gs-rakki-mood-grid">
                    {rakkiMoods.map((mood) => (
                        <article className="gs-rakki-mood-card" key={mood.title}>
                            <h3>{mood.title}</h3>
                            <p>{mood.text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
};