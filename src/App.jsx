import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Package, 
  TrendingUp, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  Calculator,
  DollarSign,
  ShoppingCart,
  Settings2,
  Calendar,
  User,
  Clock,
  CheckCircle2
} from 'lucide-react';

const App = () => {
  // --- Estados Globales ---
  const [view, setView] = useState('dashboard'); 
  const [ingredients, setIngredients] = useState([
    { id: '1', name: 'Harina de Trigo', cost: 1700, amount: 500, unit: 'gr', stock: 2500 },
    { id: '2', name: 'Azúcar Blanca', cost: 3200, amount: 1000, unit: 'gr', stock: 5000 },
    { id: '3', name: 'Mantequilla', cost: 5000, amount: 250, unit: 'gr', stock: 1000 },
    { id: '4', name: 'Huevos', cost: 18000, amount: 30, unit: 'und', stock: 60 }
  ]);
  
  const [recipes, setRecipes] = useState([
    { 
      id: 'r1', 
      name: 'Torta de Vainilla', 
      items: [
        { ingredientId: '1', quantity: 250 },
        { ingredientId: '2', quantity: 200 },
        { ingredientId: '3', quantity: 125 },
        { ingredientId: '4', quantity: 4 }
      ],
      basePrice: 25000,
      sizes: [
        { id: 's1', name: 'Original', multiplier: 1 },
        { id: 's2', name: 'Mini', multiplier: 0.2 },
        { id: 's3', name: 'Familiar', multiplier: 2.5 }
      ]
    }
  ]);
  
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([
    { id: 'o1', recipeId: 'r1', sizeId: 's3', customer: 'Andrés Pérez', date: '2024-05-15', status: 'pending' }
  ]);
  
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // --- Funciones de Cálculo ---
  const calculateIngredientUnitCost = (ing) => (ing.cost / ing.amount);

  const getRecipeBaseCost = (recipeItems) => {
    return recipeItems.reduce((total, item) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      if (!ing) return total;
      return total + (calculateIngredientUnitCost(ing) * item.quantity);
    }, 0);
  };

  // --- Componentes de Vista ---

  const Dashboard = () => {
    const totalWeeklySales = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
    const totalWeeklyCost = sales.reduce((acc, sale) => {
      const recipe = recipes.find(r => r.id === sale.recipeId);
      if (!recipe) return acc;
      const baseCost = getRecipeBaseCost(recipe.items);
      return acc + (baseCost * sale.multiplier * sale.quantity);
    }, 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return (
      <div className="p-4 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
            <ChefHat size={28} /> Dulce Gestión
          </h1>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50 flex flex-col items-center text-center">
            <div className="bg-pink-100 p-2 rounded-full mb-2">
              <TrendingUp className="text-pink-600" size={20} />
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Ventas Totales</span>
            <span className="text-lg font-bold text-gray-800">${totalWeeklySales.toLocaleString()}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-50 flex flex-col items-center text-center">
            <div className="bg-green-100 p-2 rounded-full mb-2">
              <Calendar className="text-green-600" size={20} />
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Pedidos Pendientes</span>
            <span className="text-lg font-bold text-gray-800">{pendingOrders}</span>
          </div>
        </div>

        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1 text-left">Resumen Semanal</h2>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
             <div className="text-left">
               <p className="text-xs text-gray-400">Ganancia Neta Estimada</p>
               <p className="text-2xl font-black text-green-600">${(totalWeeklySales - totalWeeklyCost).toLocaleString()}</p>
             </div>
             <DollarSign size={32} className="text-green-100" />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 text-left">Accesos</h2>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => setView('orders')} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Calendar size={20}/></div>
                <span className="font-medium text-gray-700">Gestionar Pedidos</span>
              </div>
              <ChevronRight className="text-gray-300" />
            </button>
            <button onClick={() => setView('ingredients')} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Package size={20}/></div>
                <span className="font-medium text-gray-700">Inventario / Stock</span>
              </div>
              <ChevronRight className="text-gray-300" />
            </button>
          </div>
        </section>
      </div>
    );
  };

  const IngredientsView = () => {
    const [newIng, setNewIng] = useState({ name: '', cost: '', amount: '', unit: 'gr', stock: '' });
    
    const addIngredient = () => {
      if (!newIng.name || !newIng.cost) return;
      setIngredients([...ingredients, { 
        ...newIng, 
        id: Date.now().toString(), 
        cost: Number(newIng.cost), 
        amount: Number(newIng.amount),
        stock: Number(newIng.stock || 0)
      }]);
      setNewIng({ name: '', cost: '', amount: '', unit: 'gr', stock: '' });
    };

    return (
      <div className="p-4 space-y-6 pb-24 text-left">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('dashboard')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">Insumos y Stock</h1>
        </header>

        <div className="bg-pink-50 p-4 rounded-2xl space-y-3">
          <h3 className="font-bold text-pink-700 text-xs uppercase">Nuevo Insumo</h3>
          <input type="text" placeholder="Nombre (ej: Harina)" className="w-full p-3 rounded-xl outline-none text-sm" value={newIng.name} onChange={e => setNewIng({...newIng, name: e.target.value})} />
          <div className="flex gap-2">
            <input type="number" placeholder="Costo $" className="w-1/3 p-3 rounded-xl outline-none text-sm" value={newIng.cost} onChange={e => setNewIng({...newIng, cost: e.target.value})} />
            <input type="number" placeholder="Cant. Present." className="w-1/3 p-3 rounded-xl outline-none text-sm" value={newIng.amount} onChange={e => setNewIng({...newIng, amount: e.target.value})} />
            <select className="w-1/3 p-3 rounded-xl outline-none text-sm" value={newIng.unit} onChange={e => setNewIng({...newIng, unit: e.target.value})}>
              <option value="gr">gr</option>
              <option value="ml">ml</option>
              <option value="und">und</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-pink-400 ml-1">STOCK INICIAL</label>
            <input type="number" placeholder="Ej: 5000" className="w-full p-3 rounded-xl outline-none text-sm" value={newIng.stock} onChange={e => setNewIng({...newIng, stock: e.target.value})} />
          </div>
          <button onClick={addIngredient} className="w-full bg-pink-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2"><Plus size={20} /> Guardar Insumo</button>
        </div>

        <div className="space-y-2">
          {ingredients.map(ing => (
            <div key={ing.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
              <div className="flex-1">
                <p className="font-bold text-gray-800">{ing.name}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Costo: ${ing.cost.toLocaleString()} x {ing.amount}{ing.unit}</p>
              </div>
              <div className="text-right flex items-center gap-4">
                <div className="bg-blue-50 px-3 py-1 rounded-lg">
                  <p className="text-[10px] text-blue-400 font-bold uppercase">Stock</p>
                  <p className={`font-black text-sm ${ing.stock < (ing.amount * 0.5) ? 'text-orange-500' : 'text-blue-700'}`}>{ing.stock} {ing.unit}</p>
                </div>
                <button onClick={() => setIngredients(ingredients.filter(i => i.id !== ing.id))} className="text-red-300 p-1"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OrdersView = () => {
    const [newOrder, setNewOrder] = useState({ recipeId: recipes[0]?.id || '', sizeId: '', customer: '', date: '' });
    
    // Al cambiar la receta, actualizar el tamaño por defecto
    useEffect(() => {
      const recipe = recipes.find(r => r.id === newOrder.recipeId);
      if (recipe) setNewOrder(prev => ({ ...prev, sizeId: recipe.sizes[0]?.id || '' }));
    }, [newOrder.recipeId]);

    const addOrder = () => {
      if (!newOrder.customer || !newOrder.date) return;
      setOrders([...orders, { ...newOrder, id: Date.now().toString(), status: 'pending' }]);
      setNewOrder({ ...newOrder, customer: '', date: '' });
    };

    const completeOrder = (id) => {
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'completed' } : o));
    };

    return (
      <div className="p-4 space-y-6 pb-24 text-left">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('dashboard')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">Pedidos y Encargos</h1>
        </header>

        <div className="bg-yellow-50 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-yellow-700 text-xs uppercase">Agendar Nuevo Pedido</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-yellow-600 ml-1">TORTA/POSTRE</label>
                <select className="w-full p-3 rounded-xl outline-none text-sm bg-white" value={newOrder.recipeId} onChange={e => setNewOrder({...newOrder, recipeId: e.target.value})}>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-yellow-600 ml-1">TAMAÑO</label>
                <select className="w-full p-3 rounded-xl outline-none text-sm bg-white" value={newOrder.sizeId} onChange={e => setNewOrder({...newOrder, sizeId: e.target.value})}>
                  {recipes.find(r => r.id === newOrder.recipeId)?.sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-yellow-600 ml-1">CLIENTE</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-yellow-400" />
                <input type="text" placeholder="Nombre del cliente" className="w-full p-3 pl-10 rounded-xl outline-none text-sm bg-white" value={newOrder.customer} onChange={e => setNewOrder({...newOrder, customer: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-yellow-600 ml-1">FECHA DE ENTREGA</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-3 text-yellow-400" />
                <input type="date" className="w-full p-3 pl-10 rounded-xl outline-none text-sm bg-white" value={newOrder.date} onChange={e => setNewOrder({...newOrder, date: e.target.value})} />
              </div>
            </div>

            <button onClick={addOrder} className="w-full bg-yellow-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-100">
              <Plus size={20} /> Agendar Pedido
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Próximas Entregas</h3>
          {orders.filter(o => o.status === 'pending').sort((a,b) => new Date(a.date) - new Date(b.date)).map(order => {
            const recipe = recipes.find(r => r.id === order.recipeId);
            const size = recipe?.sizes.find(s => s.id === order.sizeId);
            return (
              <div key={order.id} className="bg-white p-4 rounded-xl border-l-4 border-yellow-400 shadow-sm flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-bold text-gray-800">{recipe?.name} <span className="text-xs text-yellow-600">({size?.name})</span></p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User size={12} /> {order.customer}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-pink-500">
                    <Clock size={12} /> {new Date(order.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <button onClick={() => completeOrder(order.id)} className="bg-green-50 text-green-600 p-2 rounded-full hover:bg-green-600 hover:text-white transition-colors">
                  <CheckCircle2 size={24} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Vistas de Recetas y Ventas simplificadas para el ejemplo
  const RecipesView = () => (
    <div className="p-4 space-y-6 text-left">
      <header className="flex items-center gap-4">
        <button onClick={() => setView('dashboard')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
        <h1 className="text-xl font-bold">Mis Recetas</h1>
      </header>
      <button onClick={() => { setSelectedRecipe({ name: '', items: [], basePrice: 0, sizes: [{ id: 's-base', name: 'Original', multiplier: 1 }] }); setView('recipe_detail'); setIsEditing(true); }} className="w-full bg-orange-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2"><Plus size={22} /> Crear Nueva Receta</button>
      <div className="grid grid-cols-1 gap-4">
        {recipes.map(recipe => (
          <div key={recipe.id} onClick={() => { setSelectedRecipe(recipe); setView('recipe_detail'); setIsEditing(false); }} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><ChefHat size={24} /></div>
              <div><p className="font-bold">{recipe.name}</p><p className="text-xs text-gray-500">Precio Sugerido: ${recipe.basePrice.toLocaleString()}</p></div>
            </div>
            <ChevronRight className="text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );

  const RecipeDetailView = () => {
    const [recipeData, setRecipeData] = useState(selectedRecipe);
    const [activeSizeId, setActiveSizeId] = useState(recipeData.sizes[0]?.id || '');
    const activeSize = recipeData.sizes.find(s => s.id === activeSizeId) || recipeData.sizes[0] || { multiplier: 1 };
    const baseCost = getRecipeBaseCost(recipeData.items);
    
    const saveRecipe = () => {
      setRecipes(recipeData.id ? recipes.map(r => r.id === recipeData.id ? recipeData : r) : [...recipes, { ...recipeData, id: Date.now().toString() }]);
      setView('recipes');
    };

    return (
      <div className="p-4 space-y-6 pb-24 text-left">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('recipes')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">Configurar Receta</h1>
        </header>
        <div className="bg-white p-5 rounded-2xl border space-y-4">
           <input className="text-xl font-bold w-full outline-none" value={recipeData.name} placeholder="Nombre" onChange={e => setRecipeData({...recipeData, name: e.target.value})} />
           <div className="flex gap-4">
             <div className="flex-1">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Costo Mat. (1x)</p>
               <p className="text-xl font-black text-red-500">${Math.round(baseCost).toLocaleString()}</p>
             </div>
             <div className="flex-1 text-right">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio Venta (1x)</p>
               <input type="number" className="text-xl font-black text-green-600 w-full text-right outline-none" value={recipeData.basePrice} onChange={e => setRecipeData({...recipeData, basePrice: Number(e.target.value)})} />
             </div>
           </div>
        </div>
        
        <div className="space-y-4">
           <div className="flex justify-between items-center"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ingredientes</h3><button onClick={() => setRecipeData({...recipeData, items: [...recipeData.items, {ingredientId: ingredients[0].id, quantity: 0}]})} className="text-pink-600 text-xs font-bold">+ Añadir</button></div>
           {recipeData.items.map((item, idx) => (
             <div key={idx} className="bg-white p-3 rounded-xl border flex gap-2 items-center">
               <select className="flex-1 text-sm outline-none" value={item.ingredientId} onChange={e => {
                 const newI = [...recipeData.items]; newI[idx].ingredientId = e.target.value; setRecipeData({...recipeData, items: newI});
               }}>
                 {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
               </select>
               <input type="number" className="w-16 font-bold text-sm outline-none" value={item.quantity} onChange={e => {
                 const newI = [...recipeData.items]; newI[idx].quantity = Number(e.target.value); setRecipeData({...recipeData, items: newI});
               }} />
               <button onClick={() => setRecipeData({...recipeData, items: recipeData.items.filter((_, i) => i !== idx)})}><Trash2 size={14} className="text-red-300" /></button>
             </div>
           ))}
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tamaños y Escalas</h3><button onClick={() => setRecipeData({...recipeData, sizes: [...recipeData.sizes, {id: Date.now(), name: 'Nuevo', multiplier: 1}]})} className="text-pink-600 text-xs font-bold">+ Añadir</button></div>
           {recipeData.sizes.map((s, idx) => (
             <div key={s.id} className="bg-pink-50/50 p-3 rounded-xl flex gap-2 items-center">
               <input className="flex-1 font-bold text-sm bg-transparent outline-none" value={s.name} onChange={e => {
                 const newS = [...recipeData.sizes]; newS[idx].name = e.target.value; setRecipeData({...recipeData, sizes: newS});
               }} />
               <input type="number" step="0.1" className="w-14 font-bold text-sm outline-none px-1 rounded" value={s.multiplier} onChange={e => {
                 const newS = [...recipeData.sizes]; newS[idx].multiplier = Number(e.target.value); setRecipeData({...recipeData, sizes: newS});
               }} />
               <button onClick={() => setRecipeData({...recipeData, sizes: recipeData.sizes.filter(si => si.id !== s.id)})}><Trash2 size={14} className="text-red-300" /></button>
             </div>
           ))}
        </div>

        <button onClick={saveRecipe} className="fixed bottom-6 left-4 right-4 bg-green-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl"><Save size={20} /> Guardar Cambios</button>
      </div>
    );
  };

  const SalesView = () => {
    const [sel, setSel] = useState(recipes[0]?.id || '');
    const [sz, setSz] = useState('');
    const [q, setQ] = useState(1);
    const activeR = recipes.find(r => r.id === sel);
    useEffect(() => { if (activeR) setSz(activeR.sizes[0]?.id || ''); }, [sel]);

    const addSale = () => {
      const size = activeR.sizes.find(s => s.id === sz);
      setSales([...sales, { id: Date.now().toString(), recipeId: sel, recipeName: `${activeR.name} (${size.name})`, totalPrice: activeR.basePrice * size.multiplier * q, multiplier: size.multiplier, quantity: q, date: new Date().toLocaleDateString() }]);
    };

    return (
      <div className="p-4 space-y-6 pb-24 text-left">
        <header className="flex items-center gap-4"><button onClick={() => setView('dashboard')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button><h1 className="text-xl font-bold">Registrar Venta</h1></header>
        <div className="bg-purple-50 p-5 rounded-2xl space-y-4">
          <select className="w-full p-3 rounded-xl outline-none" value={sel} onChange={e => setSel(e.target.value)}>{recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          <div className="flex flex-wrap gap-2">{activeR?.sizes.map(s => <button key={s.id} onClick={() => setSz(s.id)} className={`px-3 py-2 rounded-xl text-xs font-bold ${sz === s.id ? 'bg-purple-600 text-white' : 'bg-white text-purple-400'}`}>{s.name}</button>)}</div>
          <div className="flex justify-between items-center"><input type="number" className="w-20 p-3 rounded-xl outline-none" value={q} onChange={e => setQ(Number(e.target.value))} /><button onClick={addSale} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus size={20} /> Vender</button></div>
        </div>
        <div className="space-y-2">{sales.map(s => <div key={s.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm"><div><p className="font-bold text-sm">{s.recipeName}</p><p className="text-xs text-gray-400">{s.quantity} un.</p></div><p className="font-black text-green-600">${s.totalPrice.toLocaleString()}</p></div>)}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-xl overflow-y-auto pb-20">
        {view === 'dashboard' && <Dashboard />}
        {view === 'ingredients' && <IngredientsView />}
        {view === 'recipes' && <RecipesView />}
        {view === 'recipe_detail' && <RecipeDetailView />}
        {view === 'orders' && <OrdersView />}
        {view === 'sales' && <SalesView />}
        
        {view !== 'recipe_detail' && (
          <nav className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-sm border-t border-gray-100 flex justify-around p-3 pb-5 z-50">
            <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-pink-600' : 'text-gray-300'}`}><TrendingUp size={20} /><span className="text-[9px] font-bold">INICIO</span></button>
            <button onClick={() => setView('ingredients')} className={`flex flex-col items-center gap-1 ${view === 'ingredients' ? 'text-pink-600' : 'text-gray-300'}`}><Package size={20} /><span className="text-[9px] font-bold">INSUMOS</span></button>
            <button onClick={() => setView('recipes')} className={`flex flex-col items-center gap-1 ${view === 'recipes' ? 'text-pink-600' : 'text-gray-300'}`}><ChefHat size={20} /><span className="text-[9px] font-bold">RECETAS</span></button>
            <button onClick={() => setView('orders')} className={`flex flex-col items-center gap-1 ${view === 'orders' ? 'text-pink-600' : 'text-gray-300'}`}><Calendar size={20} /><span className="text-[9px] font-bold">PEDIDOS</span></button>
            <button onClick={() => setView('sales')} className={`flex flex-col items-center gap-1 ${view === 'sales' ? 'text-pink-600' : 'text-gray-300'}`}><ShoppingCart size={20} /><span className="text-[9px] font-bold">VENTAS</span></button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;