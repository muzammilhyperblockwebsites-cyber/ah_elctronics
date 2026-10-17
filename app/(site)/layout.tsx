import { OrderListProvider } from '@/lib/orderListContext';
import { SiteChrome } from '@/components/site/SiteChrome';
import { getAllProducts, getCategories, getBrands, getSiteSettings } from '@/lib/db';
import { buildCategoryMenus } from '@/lib/categoryMenus';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, categories, brands, settings] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getBrands(),
    getSiteSettings(),
  ]);
  const menus = buildCategoryMenus(products, categories);

  return (
    <OrderListProvider>
      <SiteChrome
        menus={menus}
        categories={categories}
        brands={brands}
        settings={settings}
      >
        {children}
      </SiteChrome>
    </OrderListProvider>
  );
}
