import { ImageWithFallback } from './figma/ImageWithFallback';

interface Category {
  id: number;
  name: string;
  image: string;
  creators: number;
}

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <button className="group relative overflow-hidden rounded-xl aspect-video border border-gray-800 hover:border-blue-500 transition">
      <ImageWithFallback
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-4">
        <h3 className="mb-1">{category.name}</h3>
        <p className="text-sm text-gray-400">{category.creators.toLocaleString()} creators</p>
      </div>
    </button>
  );
}
