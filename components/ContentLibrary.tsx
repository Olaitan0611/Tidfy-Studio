import React, { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, PhotoIcon, VideoCameraIcon, FilmIcon, SparklesIcon, FireIcon, FaceSmileIcon } from '@heroicons/react/24/outline';

type Category = 'All' | 'Media' | 'Templates' | 'Stickers' | 'Trending';

const categories: { name: Category; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { name: 'All', icon: SparklesIcon },
    { name: 'Media', icon: PhotoIcon },
    { name: 'Templates', icon: FilmIcon },
    { name: 'Stickers', icon: FaceSmileIcon },
    { name: 'Trending', icon: FireIcon },
];

const libraryItems = [
    // Media
    { id: 1, category: 'Media', title: 'Nairobi Cityscape Drone', type: 'Video' },
    { id: 2, category: 'Media', title: 'Ghanaian Kente Fashion', type: 'Image' },
    { id: 3, category: 'Media', title: 'Lagos Market Bustle', type: 'Video' },
    { id: 4, category: 'Media', title: 'Table Mountain Sunrise', type: 'Image' },
    { id: 5, category: 'Media', title: 'Jollof Rice Close-up', type: 'Image' },
    { id: 6, category: 'Media', title: 'Maasai Mara Wildlife', type: 'Video' },
    // Templates
    { id: 7, category: 'Templates', title: 'YouTube Vlog Intro', type: 'Template' },
    { id: 8, category: 'Templates', title: 'Instagram Ad - Fashion', type: 'Template' },
    { id: 9, category: 'Templates', title: 'TikTok Comedy Skit', type: 'Template' },
    { id: 10, category: 'Templates', title: 'Real Estate Promo', type: 'Template' },
    // Stickers
    { id: 11, category: 'Stickers', title: 'Adinkra Symbols Pack', type: 'Sticker' },
    { id: 12, category: 'Stickers', title: 'Naija Slang Collection', type: 'Sticker' },
    { id: 13, category: 'Stickers', title: 'Animated Shweshwe Patterns', type: 'Sticker' },
    // Trending
    { id: 14, category: 'Trending', title: 'Viral Amapiano Dance Clip', type: 'Feed' },
    { id: 15, category: 'Trending', title: 'Top Tweet about #AfricaTech', type: 'Feed' },
    { id: 16, category: 'Trending', title: 'Trending Skit Audio', type: 'Feed' },
];


const ContentLibrary: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        return libraryItems.filter(item => {
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchTerm]);

    const getIconForType = (type: string) => {
        switch(type) {
            case 'Video': return <VideoCameraIcon className="w-8 h-8 text-text-secondary" />;
            case 'Image': return <PhotoIcon className="w-8 h-8 text-text-secondary" />;
            case 'Template': return <FilmIcon className="w-8 h-8 text-text-secondary" />;
            case 'Sticker': return <FaceSmileIcon className="w-8 h-8 text-text-secondary" />;
            case 'Feed': return <FireIcon className="w-8 h-8 text-text-secondary" />;
            default: return null;
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-text-primary">African-Focused Content Library</h3>
                <p className="text-text-secondary mt-1">Browse culturally-rich assets to kickstart your next creation.</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search for assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-11 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                    />
                </div>
                <div className="flex space-x-2 bg-surface-input/50 p-1.5 rounded-lg overflow-x-auto">
                    {categories.map(({ name, icon: Icon }) => (
                        <button
                            key={name}
                            onClick={() => setActiveCategory(name)}
                            className={`
                                w-full flex-1 group inline-flex items-center justify-center py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary whitespace-nowrap
                                ${activeCategory === name ? 'bg-secondary text-text-on-secondary shadow' : 'text-text-secondary hover:bg-surface/50 hover:text-text-primary'}
                            `}
                        >
                            <Icon className="mr-2 h-5 w-5" />
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="group relative aspect-[3/4] bg-surface/50 rounded-lg border border-border flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-secondary transition-all duration-300 hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="mb-2">{getIconForType(item.type)}</div>
                            <h4 className="font-semibold text-sm text-text-primary">{item.title}</h4>
                            <p className="text-xs text-text-tertiary">{item.type}</p>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-secondary text-text-on-secondary text-xs font-bold py-1 px-3 rounded-full opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                                Use
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4 bg-surface-input/50 rounded-lg">
                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-text-tertiary mb-4" />
                    <h4 className="text-lg font-semibold text-text-primary">No Assets Found</h4>
                    <p className="text-text-secondary">Try adjusting your search or filter settings.</p>
                </div>
            )}
        </div>
    );
};

export default ContentLibrary;
