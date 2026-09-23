import { redirect } from 'next/navigation';

export default function LegacyCatalogEditor() {
    redirect('/admin/pricing?tab=builds');
}
