import Link from 'next/link';
import { BookHeart } from 'lucide-react'; // Using BookHeart as a relevant icon

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors">
      <BookHeart className="h-7 w-7" />
      <span>Saarthi</span>
    </Link>
  );
}
