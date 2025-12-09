import React, { useState, useMemo } from 'react';
import { Creator } from '../types';
import { MagnifyingGlassIcon, UserPlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';


const mockCreators: Creator[] = [
    { id: 1, name: 'Funke Akindele', headline: 'Award-winning Actress & Producer', skills: ['Acting', 'Producing', 'Scriptwriting'], country: 'Nigeria', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Sarkodie', headline: 'Ghanaian Rapper & Entrepreneur', skills: ['Music', 'Songwriting', 'Performance'], country: 'Ghana', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Lupita Nyong\'o', headline: 'Oscar-winning Actress', skills: ['Acting', 'Directing'], country: 'Kenya', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'Black Coffee', headline: 'Grammy-winning DJ & Producer', skills: ['DJing', 'Music Production', 'Afro House'], country: 'South Africa', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
    { id: 5, name: 'TG Omori', headline: 'Top Music Video Director', skills: ['Videography', 'Directing', 'Editing'], country: 'Nigeria', avatarUrl: 'https://i.pravatar.cc/150?img=5' },
    { id: 6, name: 'Wanuri Kahiu', headline: 'Filmmaker & Afrofuturist', skills: ['Directing', 'Storytelling', 'Film'], country: 'Kenya', avatarUrl: 'https://i.pravatar.cc/150?img=6' },
    { id: 7, name: 'Peace Hyde', headline: 'Media Executive & Journalist', skills: ['Journalism', 'Broadcasting', 'Education'], country: 'Ghana', avatarUrl: 'https://i.pravatar.cc/150?img=7' },
    { id: 8, name: 'Trevor Noah', headline: 'Comedian & TV Host', skills: ['Comedy', 'Writing', 'Hosting'], country: 'South Africa', avatarUrl: 'https://i.pravatar.cc/150?img=8' },
    { id: 9, name: 'Ifeoma Nwobu', headline: 'VFX Artist & Animator', skills: ['VFX', 'Animation', '3D Modeling'], country: 'Nigeria', avatarUrl: 'https://i.pravatar.cc/150?img=9' },
    { id: 10, name: 'Juls', headline: 'Pioneer Afrobeat Producer', skills: ['Music Production', 'Afrobeat', 'DJing'], country: 'Ghana', avatarUrl: 'https://i.pravatar.cc/150?img=10' },
];

const allSkills = [...new Set(mockCreators.flatMap(c => c.skills))].sort();
const allCountries = [...new Set(mockCreators.map(c => c.country))].sort();

const CreatorCard: React.FC<{ creator: Creator }> = ({ creator }) => {
    return (
        <div className="bg-surface/50 border border-border rounded-xl p-4 text-center flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:border-secondary">
            <img src={creator.avatarUrl} alt={creator.name} className="w-24 h-24 rounded-full mb-4 border-4 border-surface" />
            <h3 className="font-bold text-lg text-text-primary">{creator.name}</h3>
            <p className="text-sm text-text-secondary mb-3">{creator.headline}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                {creator.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="bg-surface-input text-text-secondary text-xs font-medium px-2 py-1 rounded-full">
                        #{skill.toLowerCase()}
                    </span>
                ))}
            </div>
            <button className="mt-auto w-full flex items-center justify-center bg-secondary hover:bg-secondary-hover text-text-on-secondary font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Connect
            </button>
        </div>
    );
};


const CreatorNetwork: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('All');
    const [countryFilter, setCountryFilter] = useState('All');

    const filteredCreators = useMemo(() => {
        return mockCreators.filter(creator => {
            const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) || creator.headline.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSkill = skillFilter === 'All' || creator.skills.includes(skillFilter);
            const matchesCountry = countryFilter === 'All' || creator.country === countryFilter;
            return matchesSearch && matchesSkill && matchesCountry;
        });
    }, [searchTerm, skillFilter, countryFilter]);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-text-primary">Creator Network</h3>
                <p className="text-text-secondary mt-1">Discover and collaborate with talented creators across Africa.</p>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search by name or headline..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-11 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                    />
                </div>
                <div>
                     <label htmlFor="skill-filter" className="sr-only">Filter by skill</label>
                    <select
                        id="skill-filter"
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition appearance-none pr-8"
                         style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="All">All Skills</option>
                        {allSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                    </select>
                </div>
                <div>
                     <label htmlFor="country-filter" className="sr-only">Filter by country</label>
                    <select
                        id="country-filter"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition appearance-none pr-8"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="All">All Countries</option>
                        {allCountries.map(country => <option key={country} value={country}>{country}</option>)}
                    </select>
                </div>
            </div>

            {/* Featured Creators */}
            <div className="space-y-4">
                <h4 className="text-xl font-semibold text-text-primary flex items-center">
                    <CheckBadgeIcon className="w-6 h-6 mr-2 text-accent" />
                    Featured Creators
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockCreators.slice(0, 4).map(creator => (
                        <CreatorCard key={creator.id} creator={creator} />
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-border">
                <h4 className="text-xl font-semibold text-text-primary mb-4">All Creators ({filteredCreators.length})</h4>
                 {filteredCreators.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredCreators.map(creator => (
                            <CreatorCard key={creator.id} creator={creator} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 bg-surface-input/50 rounded-lg">
                        <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-text-tertiary mb-4" />
                        <h4 className="text-lg font-semibold text-text-primary">No Creators Found</h4>
                        <p className="text-text-secondary">Try adjusting your search or filter settings.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default CreatorNetwork;