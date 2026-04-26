import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  ChefHat, Package, TrendingUp, Plus, Trash2, ChevronRight, 
  ArrowLeft, Save, DollarSign, ShoppingCart, Calendar, User, Clock, CheckCircle2, Edit 
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('dashboard'); 
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: ings } = await supabase.from('ingredients').select('*');
    if (ings) setIngredients(ings);

    const { data: ords } = await supabase.from('orders').select('*');
    if (ords) {
      setOrders(ords.map(o => ({
        id: o.id, recipeId: o.recipe_id, sizeId: o.size_id,
        customer: o.customer, date: o.delivery_date, status: o.status
      })));
    }

    const { data: sls } = await supabase.from('sales').select('*');
    if (sls) {
      setSales(sls.map(s => ({
        id: s.id, recipeId: s.recipe_id, recipeName: s.recipe_name,
        totalPrice: s.total_price, multiplier: s.multiplier, quantity: s.quantity, date: s.sale_date
      })));
    }

    const { data: recs } = await supabase.from('recipes').select(`
      id, name, base_price,
      recipe_items(ingredient_id, quantity),
      recipe_sizes(id, name, multiplier)
    `);
    if (recs) {
      setRecipes(recs.map(r => ({
        id: r.id, name: r.name, basePrice: r.base_price,
        items: r.recipe_items.map(ri => ({ ingredientId: ri.ingredient_id, quantity: ri.quantity })),
        sizes: r.recipe_sizes.map(rs => ({ id: rs.id, name: rs.name, multiplier: rs.multiplier }))
      })));
    }
  };

  const calculateIngredientUnitCost = (ing) => (ing.cost / ing.amount);

  const getRecipeBaseCost = (recipeItems) => {
    return recipeItems.reduce((total, item) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      if (!ing) return total;
      return total + (calculateIngredientUnitCost(ing) * item.quantity);
    }, 0);
  };

  const Dashboard = () => {
    const now = new Date();
    const totalWeeklySales = sales.filter(s => {
      const diffTime = Math.abs(now - new Date(s.date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 7;
    }).reduce((acc, sale) => acc + sale.totalPrice, 0);

    const totalWeeklyCost = sales.filter(s => {
      const diffTime = Math.abs(now - new Date(s.date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 7;
    }).reduce((acc, sale) => {
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
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Ventas (7 días)</span>
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
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1 text-left">Resumen 7 Días</h2>
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
    const [editId, setEditId] = useState(null);
    
    const saveIngredient = async () => {
      if (!newIng.name || !newIng.cost) return;
      
      const payload = {
        name: newIng.name,
        cost: Number(newIng.cost),
        amount: Number(newIng.amount),
        unit: newIng.unit,
        stock: Number(newIng.stock || 0)
      };

      if (editId) {
        const { data } = await supabase.from('ingredients').update(payload).eq('id', editId).select();
        if (data) {
          setIngredients(ingredients.map(i => i.id === editId ? data[0] : i));
          setEditId(null);
          setNewIng({ name: '', cost: '', amount: '', unit: 'gr', stock: '' });
        }
      } else {
        const { data } = await supabase.from('ingredients').insert([payload]).select();
        if (data) {
          setIngredients([...ingredients, data[0]]);
          setNewIng({ name: '', cost: '', amount: '', unit: 'gr', stock: '' });
        }
      }
    };

    const deleteIngredient = async (id) => {
      await supabase.from('ingredients').delete().eq('id', id);
      setIngredients(ingredients.filter(i => i.id !== id));
    };

    const startEdit = (ing) => {
      setEditId(ing.id);
      setNewIng({ name: ing.name, cost: ing.cost, amount: ing.amount, unit: ing.unit, stock: ing.stock });
    };

    return (
      <div className="p-4 space-y-6 pb-24 text-left">
        <header className="flex items-center gap-4">
          <button onClick={() => { setView('dashboard'); setEditId(null); setNewIng({ name: '', cost: '', amount: '', unit: 'gr', stock: '' }); }} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">Insumos y Stock</h1>
        </header>

        <div className="bg-pink-50 p-4 rounded-2xl space-y-3">
          <h3 className="font-bold text-pink-700 text-xs uppercase">{editId ? 'Editar Insumo' : 'Nuevo Insumo'}</h3>
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
            <label className="text-[10px] font-bold text-pink-400 ml-1">STOCK ACTUAL</label>
            <input type="number" placeholder="Ej: 5000" className="w-full p-3 rounded-xl outline-none text-sm" value={newIng.stock} onChange={e => setNewIng({...newIng, stock: e.target.value})} />
          </div>
          <div className="flex gap-2">
            <button onClick={saveIngredient} className="flex-1 bg-pink-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2"><Save size={20} /> {editId ? 'Actualizar' : 'Guardar'}</button>
            {editId && <button onClick={() => {setEditId(null); setNewIng({ name: '', cost: '', amount: '', unit: 'gr', stock: '' });}} className="bg-gray-300 text-gray-700 px-4 rounded-xl font-bold">Cancelar</button>}
          </div>
        </div>

        <div className="space-y-2">
          {ingredients.map(ing => (
            <div key={ing.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
              <div className="flex-1">
                <p className="font-bold text-gray-800">{ing.name}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Costo: ${ing.cost.toLocaleString()} x {ing.amount}{ing.unit}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="bg-blue-50 px-3 py-1 rounded-lg mr-2">
                  <p className="text-[10px] text-blue-400 font-bold uppercase">Stock</p>
                  <p className={`font-black text-sm ${ing.stock < (ing.amount * 0.5) ? 'text-orange-500' : 'text-blue-700'}`}>{ing.stock} {ing.unit}</p>
                </div>
                <button onClick={() => startEdit(ing)} className="text-yellow-500 p-2 bg-yellow-50 rounded-full hover:bg-yellow-100 transition-colors"><Edit size={16} /></button>
                <button onClick={() => deleteIngredient(ing.id)} className="text-red-500 p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OrdersView = () => {
    const [newOrder, setNewOrder] = useState({ recipeId: recipes[0]?.id || '', sizeId: '', customer: '', date: '' });
    const [editOrderId, setEditOrderId] = useState(null);
    
    useEffect(() => {
      if(!editOrderId){
        const recipe = recipes.find(r => r.id === newOrder.recipeId);
        if (recipe) setNewOrder(prev => ({ ...prev, sizeId: recipe.sizes[0]?.id || '' }));
      }
    }, [newOrder.recipeId, recipes, editOrderId]);

    const saveOrder = async () => {
      if (!newOrder.customer || !newOrder.date) return;
      const payload = {
        recipe_id: newOrder.recipeId,
        size_id: newOrder.sizeId,
        customer: newOrder.customer,
        delivery_date: newOrder.date,
        status: 'pending'
      };

      if (editOrderId) {
        const { data } = await supabase.from('orders').update(payload).eq('id', editOrderId).select();
        if (data) {
          setOrders(orders.map(o => o.id === editOrderId ? {
            id: data[0].id, recipeId: data[0].recipe_id, sizeId: data[0].size_id,
            customer: data[0].customer, date: data[0].delivery_date, status: data[0].status
          } : o));
          setEditOrderId(null);
          setNewOrder({ recipeId: recipes[0]?.id || '', sizeId: '', customer: '', date: '' });
        }
      } else {
        const { data } = await supabase.from('orders').insert([payload]).select();
        if (data) {
          setOrders([...orders, {
            id: data[0].id, recipeId: data[0].recipe_id, sizeId: data[0].size_id,
            customer: data[0].customer, date: data[0].delivery_date, status: data[0].status
          }]);
          setNewOrder({ recipeId: recipes[0]?.id || '', sizeId: '', customer: '', date: '' });
        }
      }
    };

    const completeOrder = async (order) => {
      await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id);
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));

      // Automatically register the sale
      const recipe = recipes.find(r => r.id === order.recipeId);
      const size = recipe?.sizes.find(s => s.id === order.sizeId);
      
      if (recipe && size) {
        const total = recipe.basePrice * size.multiplier;
        const { data } = await supabase.from('sales').insert([{
          recipe_id: recipe.id,
          recipe_name: `${recipe.name} (${size.name}) [Pedido: ${order.customer}]`,
          total_price: total,
          multiplier: size.multiplier,
          quantity: 1
        }]).select();
        
        if (data) {
          setSales(prevSales => [{
            id: data[0].id, recipeId: data[0].recipe_id, recipeName: data[0].recipe_name,
            totalPrice: data[0].total_price, multiplier: data[0].multiplier, quantity: data[0].quantity, date: data[0].sale_date
          }, ...prevSales]);
        }
      }
    };

    const deleteOrder = async (id) => {
      await supabase.from('orders').delete().eq('id', id);
      setOrders(orders.filter(o => o.id !== id));
    };

    const startEditOrder = (order) => {
      setEditOrderId(order.id);
      setNewOrder({ recipeId: order.recipeId, sizeId: order.sizeId, customer: order.customer, date: order.date });
    };

    return (
      <div className="p-4 space-y-6 pb-24 text-left">
        <header className="flex items-center gap-4">
          <button onClick={() => { setView('dashboard'); setEditOrderId(null); }} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">Pedidos y Encargos</h1>
        </header>

        <div className="bg-yellow-50 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-yellow-700 text-xs uppercase">{editOrderId ? 'Editar Pedido' : 'Agendar Nuevo Pedido'}</h3>
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
            <div className="flex gap-2">
              <button onClick={saveOrder} className="flex-1 bg-yellow-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-100">
                <Save size={20} /> {editOrderId ? 'Actualizar Pedido' : 'Agendar Pedido'}
              </button>
              {editOrderId && <button onClick={() => {setEditOrderId(null); setNewOrder({ recipeId: recipes[0]?.id || '', sizeId: '', customer: '', date: '' });}} className="bg-gray-300 text-gray-700 px-4 rounded-xl font-bold">Cancelar</button>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Próximas Entregas</h3>
          {orders.filter(o => o.status === 'pending').sort((a,b) => new Date(a.date) - new Date(b.date)).map(order => {
            const recipe = recipes.find(r => r.id === order.recipeId);
            const size = recipe?.sizes.find(s => s.id === order.sizeId);
            return (
              <div key={order.id} className="bg-white p-4 rounded-xl border-l-4 border-yellow-400 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">{recipe?.name || 'Receta eliminada'} <span className="text-xs text-yellow-600">({size?.name || 'N/A'})</span></p>
                    <div className="flex items-center gap-2 text-xs text-gray-500"><User size={12} /> {order.customer}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-pink-500"><Clock size={12} /> {new Date(order.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <button onClick={() => completeOrder(order)} className="bg-green-50 text-green-600 p-2 rounded-full hover:bg-green-600 hover:text-white transition-colors">
                    <CheckCircle2 size={24} />
                  </button>
                </div>
                <div className="flex justify-end gap-2 border-t pt-2 border-gray-100">
                  <button onClick={() => startEditOrder(order)} className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded"><Edit size={12} /> Editar</button>
                  <button onClick={() => deleteOrder(order.id)} className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded"><Trash2 size={12} /> Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const RecipesView = () => (
    <div className="p-4 space-y-6 text-left">
      <header className="flex items-center gap-4">
        <button onClick={() => setView('dashboard')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
        <h1 className="text-xl font-bold">Mis Recetas</h1>
      </header>
      <button onClick={() => { setSelectedRecipe({ name: '', items: [], basePrice: 0, sizes: [{ id: 's-base', name: 'Original', multiplier: 1 }] }); setView('recipe_detail'); }} className="w-full bg-orange-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2"><Plus size={22} /> Crear Nueva Receta</button>
      <div className="grid grid-cols-1 gap-4">
        {recipes.map(recipe => (
          <div key={recipe.id} onClick={() => { setSelectedRecipe(recipe); setView('recipe_detail'); }} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer">
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
    const baseCost = getRecipeBaseCost(recipeData.items);
    
    const saveRecipe = async () => {
      let rId = recipeData.id;
      const oldSizes = rId ? (recipes.find(r => r.id === rId)?.sizes || []) : [];

      if (!rId) {
        const { data: rData } = await supabase.from('recipes').insert([{ name: recipeData.name, base_price: recipeData.basePrice }]).select();
        rId = rData[0].id;
      } else {
        await supabase.from('recipes').update({ name: recipeData.name, base_price: recipeData.basePrice }).eq('id', rId);
        await supabase.from('recipe_items').delete().eq('recipe_id', rId);
      }
      
      if (recipeData.items.length) {
        await supabase.from('recipe_items').insert(recipeData.items.map(i => ({ recipe_id: rId, ingredient_id: i.ingredientId, quantity: i.quantity })));
      }
      
      for (const size of recipeData.sizes) {
        if (!size.id || size.id.toString().length < 30) {
          await supabase.from('recipe_sizes').insert([{ recipe_id: rId, name: size.name, multiplier: size.multiplier }]);
        } else {
          await supabase.from('recipe_sizes').update({ name: size.name, multiplier: size.multiplier }).eq('id', size.id);
        }
      }

      const newSizeIds = recipeData.sizes.map(s => s.id);
      const sizesToDelete = oldSizes.filter(old => !newSizeIds.includes(old.id));
      for (const del of sizesToDelete) {
        const { error } = await supabase.from('recipe_sizes').delete().eq('id', del.id);
        if (error && error.code === '23503') {
          alert(`No se puede eliminar el tamaño "${del.name}" porque está asociado a un pedido activo.`);
        }
      }
      
      fetchData();
      setView('recipes');
    };

    const deleteRecipe = async () => {
      if(recipeData.id) {
        await supabase.from('recipes').delete().eq('id', recipeData.id);
        fetchData();
      }
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
           <div className="flex justify-between items-center"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ingredientes</h3><button onClick={() => {if(ingredients.length > 0) setRecipeData({...recipeData, items: [...recipeData.items, {ingredientId: ingredients[0].id, quantity: 0}]})}} className="text-pink-600 text-xs font-bold">+ Añadir</button></div>
           {recipeData.items.map((item, idx) => (
             <div key={idx} className="bg-white p-3 rounded-xl border flex gap-2 items-center">
               <select className="flex-1 text-sm outline-none bg-transparent" value={item.ingredientId} onChange={e => {
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
           <div className="flex justify-between items-center"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tamaños y Escalas</h3><button onClick={() => setRecipeData({...recipeData, sizes: [...recipeData.sizes, {id: Date.now().toString(), name: 'Nuevo', multiplier: 1}]})} className="text-pink-600 text-xs font-bold">+ Añadir</button></div>
           {recipeData.sizes.map((s, idx) => (
             <div key={idx} className="bg-pink-50/50 p-3 rounded-xl flex gap-2 items-center">
               <input className="flex-1 font-bold text-sm bg-transparent outline-none" value={s.name} onChange={e => {
                 const newS = [...recipeData.sizes]; newS[idx].name = e.target.value; setRecipeData({...recipeData, sizes: newS});
               }} />
               <input type="number" step="0.1" className="w-14 font-bold text-sm outline-none px-1 rounded bg-white" value={s.multiplier} onChange={e => {
                 const newS = [...recipeData.sizes]; newS[idx].multiplier = Number(e.target.value); setRecipeData({...recipeData, sizes: newS});
               }} />
               <button onClick={() => setRecipeData({...recipeData, sizes: recipeData.sizes.filter((_, i) => i !== idx)})}><Trash2 size={14} className="text-red-300" /></button>
             </div>
           ))}
        </div>

        <div className="fixed bottom-6 left-4 right-4 flex gap-2 z-40">
           <button onClick={saveRecipe} className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl"><Save size={20} /> Guardar</button>
           {recipeData.id && <button onClick={deleteRecipe} className="bg-red-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center shadow-xl"><Trash2 size={20} /></button>}
        </div>
      </div>
    );
  };

  const SalesView = () => {
    const [sel, setSel] = useState(recipes[0]?.id || '');
    const [sz, setSz] = useState('');
    const [q, setQ] = useState(1);
    const activeR = recipes.find(r => r.id === sel);
    
    useEffect(() => { if (activeR) setSz(activeR.sizes[0]?.id || ''); }, [sel, activeR]);

    const addSale = async () => {
      const size = activeR.sizes.find(s => s.id === sz);
      const total = activeR.basePrice * size.multiplier * q;
      const { data } = await supabase.from('sales').insert([{
        recipe_id: sel,
        recipe_name: `${activeR.name} (${size.name})`,
        total_price: total,
        multiplier: size.multiplier,
        quantity: q
      }]).select();
      
      if (data) {
        setSales([{
          id: data[0].id, recipeId: data[0].recipe_id, recipeName: data[0].recipe_name,
          totalPrice: data[0].total_price, multiplier: data[0].multiplier, quantity: data[0].quantity, date: data[0].sale_date
        }, ...sales]);
        setQ(1);
      }
    };

    const deleteSale = async (id) => {
      await supabase.from('sales').delete().eq('id', id);
      setSales(sales.filter(s => s.id !== id));
    };

    // Calculate Week and Month Resumen
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const weeklySales = sales.filter(s => {
      const diffTime = Math.abs(now - new Date(s.date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 7;
    }).reduce((acc, s) => acc + s.totalPrice, 0);

    const monthlySales = sales.filter(s => {
      const date = new Date(s.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((acc, s) => acc + s.totalPrice, 0);

    return (
      <div className="p-4 space-y-6 pb-24 text-left">
        <header className="flex items-center gap-4"><button onClick={() => setView('dashboard')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button><h1 className="text-xl font-bold">Ventas</h1></header>
        
        {/* Resumen de ventas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-100 p-4 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[10px] text-purple-600 uppercase font-bold tracking-widest">Esta Semana</span>
            <span className="text-xl font-black text-purple-900">${weeklySales.toLocaleString()}</span>
          </div>
          <div className="bg-blue-100 p-4 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[10px] text-blue-600 uppercase font-bold tracking-widest">Este Mes</span>
            <span className="text-xl font-black text-blue-900">${monthlySales.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-gray-50 border p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-gray-700 text-xs uppercase">Registrar Venta</h3>
          <select className="w-full p-3 rounded-xl outline-none bg-white" value={sel} onChange={e => setSel(e.target.value)}>
            {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div className="flex flex-wrap gap-2">{activeR?.sizes.map(s => <button key={s.id} onClick={() => setSz(s.id)} className={`px-3 py-2 rounded-xl text-xs font-bold ${sz === s.id ? 'bg-gray-800 text-white' : 'bg-white text-gray-400 border'}`}>{s.name}</button>)}</div>
          <div className="flex justify-between items-center"><input type="number" className="w-20 p-3 rounded-xl outline-none" value={q} onChange={e => setQ(Number(e.target.value))} /><button onClick={addSale} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus size={20} /> Vender</button></div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-bold text-gray-400 text-xs uppercase pt-2 tracking-widest px-1">Historial Reciente</h3>
          {sales.slice(0, 20).map(s => (
            <div key={s.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold text-sm text-gray-800">{s.recipeName}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{s.quantity} un.</span>
                  <span>{new Date(s.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-black text-green-600">${s.totalPrice.toLocaleString()}</p>
                <button onClick={() => deleteSale(s.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
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