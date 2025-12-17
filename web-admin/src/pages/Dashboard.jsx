import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import CreateStaff from '../components/CreateStaff';
import MenuManager from '../components/MenuManager';
import OrderList from '../components/OrderList';
import KitchenDisplay from '../components/KitchenDisplay';
import StatsDashboard from '../components/StatsDashboard';
import UserList from '../components/UserList';
import {
    LayoutDashboard,
    UtensilsCrossed,
    ShoppingBag,
    Users,
    ChefHat,
    LogOut,
    Menu as MenuIcon,
    UserCircle
} from 'lucide-react';

export default function Dashboard() {
    const { user, userRole } = useAuth();
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const SidebarItem = ({ id, icon: Icon, label, onClick }) => (
        <button
            onClick={() => {
                setActiveTab(id);
                setMobileMenuOpen(false);
                if (onClick) onClick();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 mb-1 group ₹{activeTab === id
                ? 'bg-primary text-white shadow-md shadow-orange-200'
                : 'text-gray-900 hover:bg-orange-50 hover:text-primary'
                }`}
        >
            <Icon size={20} className={activeTab === id ? 'text-white' : 'text-gray-900 group-hover:text-primary'} />
            <span className={`font-medium ₹{activeTab === id ? 'font-bold' : ''}`} style={{ color: activeTab === id ? 'white' : 'black' }}>{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex font-sans">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ₹{mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-gray-100">
                    <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2 tracking-tight">
                        <span className="bg-primary text-white p-1 rounded-lg"><UtensilsCrossed size={24} /></span>
                        TadkaBox
                    </h1>
                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider font-bold ml-1">{userRole} PORTAL</p>
                </div>

                <nav className="flex-1 p-6 space-y-1">
                    {userRole === 'ADMIN' && (
                        <>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Main Menu</div>
                            <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />
                            <SidebarItem id="orders" icon={ShoppingBag} label="Orders" />
                            <SidebarItem id="menu" icon={UtensilsCrossed} label="Menu Items" />
                            <SidebarItem id="users" icon={UserCircle} label="Users" />

                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-8 px-4">Management</div>
                            <SidebarItem id="staff" icon={Users} label="Staff & Users" onClick={() => setShowStaffModal(true)} />
                        </>
                    )}

                    {userRole === 'COOK' && (
                        <SidebarItem id="kitchen" icon={ChefHat} label="Kitchen Display" />
                    )}
                </nav>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.email?.split('@')[0]}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{userRole?.toLowerCase()}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => auth.signOut()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen relative">
                {/* Mobile Header */}
                <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <MenuIcon size={24} className="text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-primary">TadkaBox</h1>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {userRole === 'ADMIN' && (
                        <>
                            {activeTab === 'overview' && <StatsDashboard />}
                            {activeTab === 'menu' && <MenuManager />}
                            {activeTab === 'orders' && <OrderList />}
                            {activeTab === 'users' && <UserList />}
                        </>
                    )}

                    {userRole === 'COOK' && (
                        <KitchenDisplay />
                    )}

                    {userRole !== 'ADMIN' && userRole !== 'COOK' && (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                            <div className="bg-red-100 p-4 rounded-full mb-4">
                                <LogOut size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                            <p className="text-gray-500 max-w-md">
                                You don't have permission to access this portal. Please contact your administrator or log in with a staff account.
                            </p>
                            <button
                                onClick={() => auth.signOut()}
                                className="mt-6 text-primary font-bold hover:underline"
                            >
                                Return to Login
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {showStaffModal && <CreateStaff onClose={() => setShowStaffModal(false)} />}
        </div>
    );
}
