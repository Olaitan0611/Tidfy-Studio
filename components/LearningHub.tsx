import React from 'react';
import { AcademicCapIcon, CheckBadgeIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { FilmIcon, MusicalNoteIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const tutorials = [
    {
        title: 'Your First TikTok Skit',
        description: 'Learn the basics of scriptwriting and generating a short, funny video.',
        icon: FilmIcon,
        status: 'Completed',
    },
    {
        title: 'Mastering Amapiano Beats',
        description: 'Dive into the Music Studio to create an infectious Amapiano track.',
        icon: MusicalNoteIcon,
        status: 'Start Now',
    },
    {
        title: 'Pro-Level Voiceovers',
        description: 'Explore different voices, pitches, and rates for professional audio.',
        icon: DocumentTextIcon,
        status: 'Start Now',
    },
];

const challenges = [
    {
        title: '30-Day Content Challenge',
        description: 'Create and post one piece of content every day for a month.',
        badge: 'Consistency King/Queen',
        progress: 7,
        total: 30,
    },
    {
        title: 'Viral Video Apprentice',
        description: 'Get a video to 10,000 views using a trending sound.',
        badge: 'Trendsetter',
        progress: 0,
        total: 1,
    },
];

const TutorialCard: React.FC<typeof tutorials[0]> = ({ title, description, icon: Icon, status }) => {
    const isCompleted = status === 'Completed';
    return (
        <div className={`p-6 rounded-xl border-2 transition-all duration-300 flex items-start space-x-4 ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-surface/50 border-border hover:border-secondary'}`}>
            <div className={`flex-shrink-0 p-3 rounded-lg ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-surface-input text-secondary'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-text-primary">{title}</h4>
                    {isCompleted && <CheckBadgeIcon className="w-6 h-6 text-green-500" />}
                </div>
                <p className="text-sm text-text-secondary mt-1 mb-4">{description}</p>
                <button disabled={isCompleted} className="flex items-center text-sm font-semibold text-secondary hover:text-secondary-hover disabled:text-text-tertiary disabled:cursor-not-allowed">
                    {status} <ArrowRightIcon className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
};

const ChallengeCard: React.FC<typeof challenges[0]> = ({ title, description, badge, progress, total }) => {
    const percentage = (progress / total) * 100;
    return (
        <div className="p-6 bg-surface/50 border border-border rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
                <SparklesIcon className="w-6 h-6 text-accent" />
                <h4 className="font-bold text-text-primary">{title}</h4>
            </div>
            <p className="text-sm text-text-secondary mb-4">{description}</p>
            <div className="space-y-2">
                 <div className="flex justify-between text-xs font-medium text-text-secondary">
                    <span>Progress</span>
                    <span>{progress} / {total}</span>
                </div>
                <div className="w-full bg-surface-input rounded-full h-2.5">
                    <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="text-xs text-text-tertiary">Badge Reward: <span className="font-semibold text-accent">{badge}</span></p>
            </div>
        </div>
    );
};

const LearningHub: React.FC = () => {
    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-2xl font-bold text-text-primary flex items-center">
                    <AcademicCapIcon className="w-8 h-8 mr-3 text-primary" />
                    Learning & Development Hub
                </h3>
                <p className="text-text-secondary mt-1">Level up your content creation skills with guided tutorials and challenges.</p>
            </div>

            {/* Tutorials Section */}
            <section>
                <h4 className="text-xl font-semibold text-text-primary mb-4">Tutorials</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tutorials.map(tutorial => (
                        <TutorialCard key={tutorial.title} {...tutorial} />
                    ))}
                </div>
            </section>

            {/* Challenges Section */}
            <section>
                <h4 className="text-xl font-semibold text-text-primary mb-4">Active Challenges</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenges.map(challenge => (
                        <ChallengeCard key={challenge.title} {...challenge} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LearningHub;
