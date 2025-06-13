// src/app/[...not_found]/page.tsx
import { notFound } from 'next/navigation';

export default function CatchAllNotFound() {
  // This will trigger the not-found.tsx page
  notFound();
}