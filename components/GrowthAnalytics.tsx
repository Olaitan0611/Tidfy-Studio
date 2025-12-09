import React from 'react';
// FIX: Import SparklesIcon from @heroicons/react/24/solid.
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon, LightBulbIcon, ClockIcon, FireIcon, FilmIcon, UserGroupIcon, HeartIcon, ShareIcon, EyeIcon, SparklesIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

// --- Mock Data ---
const performanceStats = [
    { name: 'Views', value: '2.1M', change: '+15.2%', changeType: 'increase', icon: EyeIcon },
    { name: 'Likes', value: '189K', change: '+8.7%', changeType: 'increase', icon: HeartIcon },
    { name: 'Shares', value: '23.4K', change: '-2.1%', changeType: 'decrease', icon: ShareIcon },
    { name: 'Followers', value: '112K', change: '+2K', changeType: 'increase', icon: UserGroupIcon },
];

const chartData = [30, 45, 40, 55, 60, 75, 70, 65, 80, 90, 85, 100]; // last 12 points for simplicity

const bestTimesToPost = [
    { platform: 'TikTok', time: '6 PM - 9 PM (Fri, Sat)', icon: 'https://img.icons8.com/ios-filled/50/tiktok--v1.png' },
    { platform: 'YouTube', time: '12 PM - 4 PM (Sat, Sun)', icon: 'https://img.icons8.com/ios-filled/50/youtube-play.png' },
    { platform: 'Instagram', time: '9 AM - 11 AM (Mon, Wed, Thu)', icon: 'https://img.icons8.com/ios-filled/50/instagram-new--v1.png' },
];

const optimalLengths = [
    { platform: 'TikTok', length: '15-30 seconds' },
    { platform: 'YouTube', length: '8-12 minutes (long-form)' },
    { platform: 'Reels', length: '7-15 seconds' },
];

const trendingTopics = [
    '#AmapianoToTheWorld',
    '#AfricanFashionWeek',
    '#TechInAfrica',
    '#JollofWars',
];

const localTrends = [
    { platform: 'TikTok NG', type: 'Sound', title: '“Focus” by Ajimovoix', trend: 'Used in 200k+ videos this week.' },
    { platform: 'Instagram ZA', type: 'Challenge', title: '#NkaoTempela Dance', trend: 'Exploding in popularity in Johannesburg.' },
    { platform: 'YouTube KE', type: 'Topic', title: 'Kenyan Election Commentary', trend: 'High search volume and watch time.' },
    { platform: 'Twitter GH', type: 'Hashtag', title: '#AccraWeDey', trend: 'Trending for events and lifestyle content.' },
];

const aiSuggestions = [
    "Your comedy skits get 30% more shares. Create a mini-series!",
    "Collaborate with a creator in the 'Food & Lifestyle' niche to expand your audience.",
    "Your audience engagement is highest on Saturdays. Try posting twice that day.",
];

const recommendedForYou = [
    { title: 'Create a "Day in the Life" vlog', reason: 'High audience interest in personal content' },
    { title: 'Start a tutorial series on video editing', reason: 'Your tech-related posts perform well' },
    { title: 'Interview a local artist or entrepreneur', reason: 'Showcases community and drives engagement' },
];

// --- Sub-components ---
const StatCard: React.FC<{ stat: typeof performanceStats[0] }> = ({ stat }) => {
    const isIncrease = stat.changeType === 'increase';
    return (
        <div className="bg-surface/50 border border-border rounded-xl p-4">
            <div className="flex items-center">
                <div className="p-2 bg-surface-input rounded-md mr-4">
                    <stat.icon className="w-6 h-6 text-text-secondary" />
                </div>
                <div>
                    <p className="text-sm text-text-secondary">{stat.name}</p>
                    <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                </div>
            </div>
            <div className={`mt-2 flex items-center text-sm ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                {isIncrease ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
                <span>{stat.change}</span>
                <span className="text-text-tertiary ml-1">vs last 30 days</span>
            </div>
        </div>
    );
};

const PerformanceChart: React.FC = () => {
    const points = chartData.map((p, i) => `${(i / (chartData.length - 1)) * 100},${100 - p}`).join(' ');
    return (
        <div className="bg-surface/50 border border-border rounded-xl p-4 h-64 relative">
             <p className="font-semibold text-text-primary mb-2">Follower Growth (Last 30 Days)</p>
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polyline
                    fill="url(#chartGradient)"
                    stroke="var(--color-secondary)"
                    strokeWidth="2"
                    points={`0,100 ${points} 100,100`}
                />
            </svg>
        </div>
    );
};


const GrowthAnalytics: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-text-primary">AI Growth & Analytics Studio</h3>
                <p className="text-text-secondary mt-1">Your personalized dashboard for content strategy and performance.</p>
            </div>

            {/* Performance Analytics */}
            <section>
                <h4 className="text-xl font-semibold text-text-primary mb-4 flex items-center"><ChartBarIcon className="w-6 h-6 mr-2 text-accent"/>Performance Analytics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {performanceStats.map(stat => <StatCard key={stat.name} stat={stat} />)}
                </div>
                <PerformanceChart />
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Engagement Optimizer */}
                <section className="space-y-4">
                    <h4 className="text-xl font-semibold text-text-primary flex items-center"><LightBulbIcon className="w-6 h-6 mr-2 text-accent"/>Engagement Optimizer</h4>
                    <div className="bg-surface/50 border border-border rounded-xl p-4">
                        <h5 className="font-semibold mb-3 flex items-center"><ClockIcon className="w-5 h-5 mr-2"/>Best Times to Post</h5>
                        <ul className="space-y-2">
                            {bestTimesToPost.map(item => (
                                <li key={item.platform} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                         <img src={item.icon} alt={item.platform} className="w-5 h-5 mr-3 filter dark:invert" />
                                        <span className="text-text-primary font-medium">{item.platform}</span>
                                    </div>
                                    <span className="text-text-secondary">{item.time}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="bg-surface/50 border border-border rounded-xl p-4">
                        <h5 className="font-semibold mb-3 flex items-center"><FilmIcon className="w-5 h-5 mr-2"/>Optimal Video Length</h5>
                         <ul className="space-y-2">
                            {optimalLengths.map(item => (
                                <li key={item.platform} className="flex items-center justify-between text-sm">
                                    <span className="text-text-primary font-medium">{item.platform}</span>
                                    <span className="text-text-secondary bg-surface-input px-2 py-0.5 rounded">{item.length}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-surface/50 border border-border rounded-xl p-4">
                        <h5 className="font-semibold mb-3 flex items-center"><FireIcon className="w-5 h-5 mr-2"/>Trending Topics</h5>
                         <div className="flex flex-wrap gap-2">
                            {trendingTopics.map(topic => (
                                <span key={topic} className="bg-surface-input text-secondary text-sm font-medium px-3 py-1 rounded-full">{topic}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Content Strategy Assistant */}
                <section className="space-y-4">
                    <h4 className="text-xl font-semibold text-text-primary flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-accent"/>Content Strategy Assistant</h4>
                    <div className="bg-surface/50 border border-border rounded-xl p-4">
                        <h5 className="font-semibold mb-3">AI Suggestions</h5>
                        <ul className="space-y-2 text-sm list-disc list-inside text-text-secondary">
                            {aiSuggestions.map((suggestion, i) => <li key={i}><span className="text-text-primary">{suggestion}</span></li>)}
                        </ul>
                    </div>
                    <div className="bg-surface/50 border border-border rounded-xl p-4">
                        <h5 className="font-semibold mb-3">Recommended For You</h5>
                        <div className="space-y-3">
                            {recommendedForYou.map(rec => (
                                <div key={rec.title} className="bg-surface p-3 rounded-md">
                                    <p className="font-semibold text-text-primary">{rec.title}</p>
                                    <p className="text-xs text-text-secondary">{rec.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

             {/* Local Trends API */}
             <section className="lg:col-span-2">
                <h4 className="text-xl font-semibold text-text-primary mb-4 flex items-center"><FireIcon className="w-6 h-6 mr-2 text-accent"/>Local Viral Content</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {localTrends.map(trend => (
                        <div key={trend.title} className="bg-surface/50 border border-border rounded-xl p-4 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{trend.platform}</span>
                                <span className="text-xs font-semibold text-text-secondary bg-surface-input px-2 py-0.5 rounded">{trend.type}</span>
                            </div>
                            <p className="font-semibold text-text-primary mb-1 flex-grow">{trend.title}</p>
                            <p className="text-sm text-text-secondary mb-4">{trend.trend}</p>
                            <button className="mt-auto w-full flex items-center justify-center bg-surface hover:bg-border text-text-primary font-bold py-2 px-3 rounded-lg text-sm transition-colors">
                                <PlayCircleIcon className="w-5 h-5 mr-2" />
                                View Trend
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default GrowthAnalytics;