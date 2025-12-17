import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';

export default function MenuManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'menuItems'));
            const menuList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setItems(menuList);
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const itemData = {
            name,
            description,
            price: parseFloat(price),
            category,
            imageUrl,
            isAvailable: true,
            updatedAt: new Date()
        };

        try {
            if (editingItem) {
                await updateDoc(doc(db, 'menuItems', editingItem.id), itemData);
            } else {
                itemData.createdAt = new Date();
                await addDoc(collection(db, 'menuItems'), itemData);
            }
            closeModal();
            fetchItems();
        } catch (error) {
            alert("Error saving item: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await deleteDoc(doc(db, 'menuItems', id));
                fetchItems();
            } catch (error) {
                alert("Error deleting item");
            }
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setDescription(item.description);
            setPrice(item.price);
            setCategory(item.category);
            setImageUrl(item.imageUrl);
        } else {
            setEditingItem(null);
            setName('');
            setDescription('');
            setPrice('');
            setCategory('');
            setImageUrl('');
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    if (loading) return <div className="p-4">Loading menu...</div>;

    const loadSampleData = async () => {
        if (!confirm('This will add a FULL Indian menu to your database. Continue?')) return;

        const sampleItems = [
            // Starters
            {
                name: "Paneer Tikka",
                price: 280,
                category: "Starters",
                description: "Marinated cottage cheese cubes grilled to perfection.",
                imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Chicken 65",
                price: 320,
                category: "Starters",
                description: "Spicy, deep-fried chicken dish originating from Chennai.",
                imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Samosa Platter",
                price: 150,
                category: "Starters",
                description: "Crispy pastry filled with spiced potatoes and peas.",
                imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // Main Course
            {
                name: "Butter Chicken",
                price: 350,
                category: "Main Course",
                description: "Tender chicken cooked in a rich tomato and butter gravy.",
                imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Dal Makhani",
                price: 240,
                category: "Main Course",
                description: "Creamy black lentils cooked overnight with butter and spices.",
                imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Hyderabadi Biryani",
                price: 400,
                category: "Main Course",
                description: "Aromatic basmati rice cooked with spices and marinated chicken.",
                imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Palak Paneer",
                price: 290,
                category: "Main Course",
                description: "Cottage cheese cubes in a smooth spinach gravy.",
                imageUrl: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // South Indian
            {
                name: "Masala Dosa",
                price: 150,
                category: "South Indian",
                description: "Crispy rice crepe filled with spiced potato masala.",
                imageUrl: "https://images.unsplash.com/photo-1589301760557-01db6915d130?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Idli Sambar",
                price: 100,
                category: "South Indian",
                description: "Steamed rice cakes served with lentil soup and chutney.",
                imageUrl: "https://images.unsplash.com/photo-1589301760557-01db6915d130?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", // Reusing dosa image as placeholder or find better
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // Desserts
            {
                name: "Gulab Jamun",
                price: 120,
                category: "Dessert",
                description: "Soft milk solids soaked in sugar syrup.",
                imageUrl: "https://images.unsplash.com/photo-1593701478530-bf2b87438b5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Rasmalai",
                price: 140,
                category: "Dessert",
                description: "Soft cottage cheese patties in sweetened, saffron-flavored milk.",
                imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", // Placeholder
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // Drinks
            {
                name: "Mango Lassi",
                price: 100,
                category: "Drinks",
                description: "Refreshing yogurt-based drink with mango pulp.",
                imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Masala Chai",
                price: 40,
                category: "Drinks",
                description: "Spiced Indian tea brewed with milk and aromatic spices.",
                imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Cold Coffee",
                price: 120,
                category: "Drinks",
                description: "Chilled creamy coffee topped with chocolate powder.",
                imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Virgin Mojito",
                price: 110,
                category: "Drinks",
                description: "Refreshing mint and lemon mocktail with soda.",
                imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // Fast Food
            {
                name: "Aloo Tikki Burger",
                price: 80,
                category: "Fast Food",
                description: "Crispy potato patty burger with indian spices and sauces.",
                imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Veg Cheese Grill Sandwich",
                price: 120,
                category: "Fast Food",
                description: "Loaded with vegetables and cheese, grilled to perfection.",
                imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Peri Peri Fries",
                price: 100,
                category: "Fast Food",
                description: "Crispy french fries tossed in spicy peri peri masala.",
                imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Margherita Pizza",
                price: 250,
                category: "Fast Food",
                description: "Classic pizza with tomato sauce, mozzarella cheese and basil.",
                imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Veg Momos",
                price: 90,
                category: "Fast Food",
                description: "Steamed dumplings filled with mixed vegetables.",
                imageUrl: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // More Main Course
            {
                name: "Chole Bhature",
                price: 160,
                category: "Main Course",
                description: "Spicy chickpea curry served with fried bread.",
                imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Rajma Chawal",
                price: 140,
                category: "Main Course",
                description: "Comfort food consisting of red kidney beans and rice.",
                imageUrl: "https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", // Placeholder
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        try {
            for (const item of sampleItems) {
                await addDoc(collection(db, 'menuItems'), item);
            }
            alert('Full Indian menu added successfully!');
            fetchItems();
        } catch (error) {
            console.error("Error adding sample data: ", error);
            alert("Error adding sample data.");
        }
    };

    const handleClearAll = async () => {
        if (!confirm('WARNING: This will DELETE ALL items from your menu. This action cannot be undone. Are you sure?')) return;

        try {
            const querySnapshot = await getDocs(collection(db, 'menuItems'));
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            alert('All menu items have been deleted.');
            fetchItems();
        } catch (error) {
            console.error("Error clearing menu:", error);
            alert("Error clearing menu.");
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
                    <p className="text-gray-500 mt-1">Organize your food items and prices</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleClearAll}
                        className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold hover:bg-red-100 transition flex items-center gap-2"
                    >
                        <Trash2 size={18} /> Clear Full Menu
                    </button>
                    <button
                        onClick={loadSampleData}
                        className="bg-purple-100 text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-200 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        + Add Indian Menu
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <span>+</span> Add New Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                    <div key={item.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={item.imageUrl || 'https://via.placeholder.com/300'}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                <span className="text-primary font-bold">₹{item.price.toFixed(2)}</span>
                            </div>
                            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                <span className="text-white text-xs font-bold uppercase tracking-wide">{item.category}</span>
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{item.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{item.description}</p>

                            <div className="flex gap-2 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => openModal(item)}
                                    className="flex-1 bg-gray-50 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg font-medium hover:bg-red-100 transition text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-1">Item Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded" rows="3" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Price (₹)</label>
                                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border p-2 rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Category</label>
                                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. Pizza" required />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-1">Image URL</label>
                                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full border p-2 rounded" placeholder="https://..." required />
                                <p className="text-xs text-gray-500 mt-1">Paste a direct image link (e.g. from Unsplash or Cloudinary)</p>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 bg-gray-200 py-2 rounded text-gray-700">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded font-bold">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
