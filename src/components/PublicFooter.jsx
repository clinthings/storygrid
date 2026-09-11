import React from 'react';
import { Link } from 'react-router-dom';
import AdSlot from './AdSlot';

export default function PublicFooter({ categories = [] }) {
    return (
        <footer className="mt-20 border-t border-white/10 bg-[#07070a] px-4 py-12 sm:px-6 lg:px-10">
            <AdSlot label="Footer advertisement" variant="footer" className="mx-auto mb-10 max-w-7xl border-x" />
            <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
                <div><p className="text-xl font-black tracking-tight text-white">STORY<span className="text-cyan-300">GRID</span></p><p className="mt-3 max-w-sm text-sm leading-relaxed text-white/40">Independent stories, ideas, and perspectives for a changing world.</p></div>
                <div><h2 className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Explore</h2><div className="mt-4 flex flex-col items-start gap-3 text-sm text-white/55"><Link to="/">Home</Link><Link to="/account">Reader account</Link><Link to="/advertise">Advertise with us</Link><Link to="/privacy">Privacy policy</Link><Link to="/#latest">Latest stories</Link></div></div>
                <div><h2 className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Categories</h2><div className="mt-4 flex flex-wrap gap-x-4 gap-y-3 text-sm text-white/55">{categories.map(category => <Link key={category.id} to={`/category/${category.slug}`}>{category.name}</Link>)}</div></div>
            </div>
            <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-white/30">© {new Date().getFullYear()} StoryGrid. All rights reserved.</div>
        </footer>
    );
}
