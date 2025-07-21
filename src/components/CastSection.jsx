import React from 'react';

const CastSection = ({ cast, getImageUrl }) => {
  const topBilledCast = cast?.slice(0, 7) || [];
  if (!topBilledCast.length) {
    return null;
  }
  return (
    <div className="mt-10 mb-12">
      <h2 className="text-2xl font-bold mb-6">Top Billed Cast</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar md:grid md:grid-cols-4 lg:grid-cols-7">
        {topBilledCast.map((person) => (
          <div
            key={person.id}
            className="flex-none w-[160px] md:w-auto bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-[2/3] overflow-hidden">
              {person.profile_path ? (
                <img
                  src={getImageUrl(person.profile_path, 'w185')}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-bold text-white text-sm truncate">{person.name}</p>
              {person.character && (
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {person.character}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="h-px bg-gray-800 my-8"></div>
    </div>
  );
};

export default CastSection;
