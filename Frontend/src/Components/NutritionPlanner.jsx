import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Target, TrendingUp, Calendar, Apple, ArrowLeft } from 'lucide-react';

const NutritionPlanner = ({ onBack }) => {
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    time: 'breakfast'
  });
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const mealTimes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const addMeal = () => {
    if (newMeal.name && newMeal.calories) {
      setMeals([...meals, {
        ...newMeal,
        id: Date.now(),
        date: selectedDate,
        calories: parseFloat(newMeal.calories) || 0,
        protein: parseFloat(newMeal.protein) || 0,
        carbs: parseFloat(newMeal.carbs) || 0,
        fat: parseFloat(newMeal.fat) || 0
      }]);
      setNewMeal({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        time: 'breakfast'
      });
    }
  };

  const deleteMeal = (id) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const todaysMeals = meals.filter(meal => meal.date === selectedDate);

  const totals = todaysMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const getProgressColor = (current, goal) => {
    const percentage = (current / goal) * 100;
    if (percentage < 80) return 'bg-red-500';
    if (percentage < 100) return 'bg-yellow-500';
    if (percentage <= 110) return 'bg-teal-500';
    return 'bg-orange-500';
  };

  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  const mealsByTime = mealTimes.map(time => ({
    time,
    meals: todaysMeals.filter(meal => meal.time === time)
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
          

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Apple size={20} className="text-blue-600" />
              <h1 className="text-slate-900 font-extrabold text-2xl">Nutrition Planner</h1>
            </div>
            <p className="text-slate-400 text-sm">Track your daily nutrition and reach your health goals</p>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Daily Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date Selector */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Select Date</h2>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                />
              </div>

              {/* Daily Progress */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Daily Progress</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(totals).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="text-2xl font-bold text-slate-900">{Math.round(value)}</div>
                        <div className="text-sm text-slate-600 capitalize">{key}</div>
                        <div className="text-xs text-slate-500">/ {dailyGoals[key]}</div>
                        <div className="mt-2 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(value, dailyGoals[key])}`}
                            style={{ width: `${getProgressPercentage(value, dailyGoals[key])}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meals by Time */}
              <div className="space-y-4">
                {mealsByTime.map(({ time, meals: timeMeals }) => (
                  <div key={time} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 capitalize mb-4">{time}</h3>
                    {timeMeals.length === 0 ? (
                      <p className="text-slate-500 italic">No meals added for {time}</p>
                    ) : (
                      <div className="space-y-3">
                        {timeMeals.map(meal => (
                          <div key={meal.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl hover:shadow-md transition-all border border-slate-200">
                            <div>
                              <h4 className="font-semibold text-slate-900">{meal.name}</h4>
                              <div className="text-sm text-slate-600 flex flex-wrap gap-4 mt-1">
                                <span>{meal.calories} cal</span>
                                <span>{meal.protein}g protein</span>
                                <span>{meal.carbs}g carbs</span>
                                <span>{meal.fat}g fat</span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteMeal(meal.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Add Meal & Goals */}
            <div className="space-y-6">
              {/* Add New Meal */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Plus size={18} className="text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Add Meal</h2>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Meal name"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  />
                  
                  <select
                    value={newMeal.time}
                    onChange={(e) => setNewMeal({...newMeal, time: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  >
                    {mealTimes.map(time => (
                      <option key={time} value={time} className="capitalize">{time}</option>
                    ))}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Calories"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal({...newMeal, protein: e.target.value})}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={newMeal.carbs}
                      onChange={(e) => setNewMeal({...newMeal, carbs: e.target.value})}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Fat (g)"
                      value={newMeal.fat}
                      onChange={(e) => setNewMeal({...newMeal, fat: e.target.value})}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    />
                  </div>
                  
                  <button
                    onClick={addMeal}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Meal
                  </button>
                </div>
              </div>

              {/* Daily Goals */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Target size={18} className="text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Daily Goals</h2>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(dailyGoals).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">
                        {key} {key !== 'calories' ? '(g)' : ''}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setDailyGoals({...dailyGoals, [key]: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionPlanner;