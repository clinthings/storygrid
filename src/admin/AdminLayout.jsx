import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCms } from '../lib/useCms';
import {
    LayoutDashboard,
    FileText,
    PenSquare,
    Archive,
    BookMarked,
    FolderOpen,
    ImageIcon,
    Settings,
    MessageSquare,
    LogOut,
    Menu,
    X,
    Zap,
    ChevronRight,
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const NAV = [
    {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: 'All Posts',
        href: '/admin/posts',
        icon: FileText,
    },
    {
        label: 'Create Post',
        href: '/admin/posts/new',
        icon: PenSquare,
    },
    {
        label: 'Drafts',
        href: '/admin/drafts',
        icon: Archive,
    },
    {
        label: 'Published',
        href: '/admin/published',
        icon: BookMarked,
    },
    {
        label: 'Categories',
        href: '/admin/categories',
        icon: FolderOpen,
    },
    {
        label: 'Media',
        href: '/admin/media',
        icon: ImageIcon,
    },
    {
        label: 'Comments',
        href: '/admin/comments',
        icon: MessageSquare,
    },
    {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

function SidebarLink({ item, onClick }) {
    const Icon = item.icon;

    return (
        <NavLink
            to={item.href}
            end={item.exact}
            onClick={onClick}
            className={({ isActive }) =>
                [
                    'flex items-center gap-3 px-4 py-3 rounded-xl',
                    'text-sm font-semibold transition-all duration-200 group',
                    isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5',
                ].join(' ')
            }
        >
            <Icon size={17} className="flex-shrink-0" />

            <span>{item.label}</span>

            <ChevronRight
                size={13}
                className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity"
            />
        </NavLink>
    );
}

const SidebarContent = ({ posts, draftPosts, publishedCount, handleLogout, closeMobileMenu }) => (
        <aside className="flex flex-col h-full py-6 px-4">

            {/* Logo */}
            <div className="flex items-center gap-3 px-2 mb-8">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                        background:
                            'linear-gradient(135deg, #22d3ee, #a855f7)',
                    }}
                >
                    <Zap
                        size={18}
                        fill="white"
                        color="white"
                    />
                </div>

                <div>
                    <p
                        className="text-lg font-black tracking-tighter leading-none"
                        style={{
                            fontFamily:
                                '"Bebas Neue", Impact, sans-serif',
                        }}
                    >
                        <span className="text-white">
                            STORY
                        </span>

                        <span style={{ color: '#22d3ee' }}>
                            GRID
                        </span>
                    </p>

                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        CMS Admin
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 flex-grow">
                {NAV.map((item) => (
                    <SidebarLink
                        key={item.href}
                        item={item}
                        onClick={closeMobileMenu}
                    />
                ))}
            </nav>

            {/* Stats */}
            <div
                className="mt-6 p-4 rounded-2xl text-xs space-y-2"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border:
                        '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <div className="flex justify-between text-white/50">
                    <span>Total Posts</span>
                    <span className="text-white font-bold">
                        {posts.length}
                    </span>
                </div>

                <div className="flex justify-between text-white/50">
                    <span>Drafts</span>
                    <span className="text-yellow-400 font-bold">
                        {draftPosts.length}
                    </span>
                </div>

                <div className="flex justify-between text-white/50">
                    <span>Published</span>
                    <span className="text-green-400 font-bold">
                        {publishedCount}
                    </span>
                </div>
            </div>

            {/* Logout */}
            <button
                type="button"
                onClick={handleLogout}
                className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
            >
                <LogOut size={16} />
                <span>Logout</span>
            </button>
        </aside>
    );

export function AdminLayout({ children }) {
    const { logout, posts = [], draftPosts = [] } = useCms();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const closeMobileMenu = () => {
        setMobileOpen(false);
    };

    const publishedCount = Math.max(
        0,
        posts.length - draftPosts.length
    );

    return (
        <div className="admin-shell min-h-screen flex bg-[#050507] text-[#f0f0f5]">

            {/* Desktop Sidebar */}
            <div
                className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0"
                style={{
                    background: '#0a0a0f',
                    borderRight:
                        '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <SidebarContent posts={posts} draftPosts={draftPosts} publishedCount={publishedCount} handleLogout={handleLogout} closeMobileMenu={closeMobileMenu} />
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <Motion.div
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                        />

                        <Motion.div
                            className="fixed top-0 left-0 bottom-0 z-50 w-72 lg:hidden flex flex-col"
                            style={{
                                background: '#0a0a0f',
                                borderRight:
                                    '1px solid rgba(255,255,255,0.07)',
                            }}
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                            }}
                        >
                            <button
                                type="button"
                                className="absolute top-4 right-4 text-white/40 hover:text-white"
                                onClick={closeMobileMenu}
                            >
                                <X size={20} />
                            </button>

                            <SidebarContent posts={posts} draftPosts={draftPosts} publishedCount={publishedCount} handleLogout={handleLogout} closeMobileMenu={closeMobileMenu} />
                        </Motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">

                {/* Mobile Header */}
                <header
                    className="lg:hidden flex items-center justify-between px-4 py-4 border-b"
                    style={{
                        background: '#0a0a0f',
                        borderColor:
                            'rgba(255,255,255,0.07)',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="text-white/60 hover:text-white"
                    >
                        <Menu size={22} />
                    </button>

                    <p
                        className="text-sm font-black tracking-tighter"
                        style={{
                            fontFamily:
                                '"Bebas Neue", Impact, sans-serif',
                        }}
                    >
                        <span className="text-white">
                            STORY
                        </span>

                        <span style={{ color: '#22d3ee' }}>
                            GRID
                        </span>
                    </p>

                    <div className="w-6" />
                </header>

                {/* Page */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#050507]">
                    {children}
                </main>
            </div>
        </div>
    );
}