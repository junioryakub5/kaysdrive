import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    keywords?: string;
    image?: string;
}

const DEFAULT_IMAGE = 'https://kaysdrive.com/og-image.jpg';

const setMeta = (selector: string, attr: string, value: string, attrType: 'name' | 'property' = 'name') => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrType, attr);
        document.head.appendChild(el);
    }
    el.setAttribute('content', value);
};

export const SEO = ({ title, description, canonical, keywords, image = DEFAULT_IMAGE }: SEOProps) => {
    const location = useLocation();

    useEffect(() => {
        const fullTitle = title.includes("Kay's Drive") ? title : `${title} | Kay's Drive`;
        const canonicalUrl = canonical || `https://kaysdrive.com${location.pathname}`;

        // Title
        document.title = fullTitle;

        // Basic meta
        setMeta('meta[name="description"]', 'description', description);
        if (keywords) setMeta('meta[name="keywords"]', 'keywords', keywords);

        // Canonical
        let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonicalUrl);

        // Open Graph
        setMeta('meta[property="og:title"]', 'og:title', fullTitle, 'property');
        setMeta('meta[property="og:description"]', 'og:description', description, 'property');
        setMeta('meta[property="og:url"]', 'og:url', canonicalUrl, 'property');
        setMeta('meta[property="og:image"]', 'og:image', image, 'property');

        // Twitter
        setMeta('meta[property="twitter:title"]', 'twitter:title', fullTitle, 'property');
        setMeta('meta[property="twitter:description"]', 'twitter:description', description, 'property');
        setMeta('meta[property="twitter:image"]', 'twitter:image', image, 'property');

    }, [title, description, canonical, keywords, image, location.pathname]);

    return null;
};
