import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Milestone, Todo } from '../types';
import { BoatingSprite } from '../components/dashboard/BoatingSprite';

export default function TacticalPlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (params.milestone) {
      try {
        setMilestone(JSON.parse(params.milestone as string));
      } catch (e) {
        console.error("Failed to parse milestone", e);
      }
    } else {
      loadActiveMilestone();
    }
  }, [params.milestone]);

  const loadActiveMilestone = async () => {
    const saved = await AsyncStorage.getItem('activeMilestone');
    if (saved) setMilestone(JSON.parse(saved));
  };

  const saveMilestone = async (updatedMilestone: Milestone) => {
    setMilestone(updatedMilestone);
    await AsyncStorage.setItem('activeMilestone', JSON.stringify(updatedMilestone));

    const stackStr = await AsyncStorage.getItem('milestoneStack');
    if (stackStr) {
      const stack: Milestone[] = JSON.parse(stackStr);
      const updatedStack = stack.map(m => m.id === updatedMilestone.id ? updatedMilestone : m);
      await AsyncStorage.setItem('milestoneStack', JSON.stringify(updatedStack));
    }
  };

  const handleToggleTodo = (todoId: string) => {
    if (!milestone) return;
    const updatedTodos = milestone.todos?.map(t =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    ) || [];
    saveMilestone({ ...milestone, todos: updatedTodos });
  };

  const handleAddTodo = () => {
    if (!milestone || !newTodo.trim()) return;
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      task: newTodo.trim(),
      completed: false
    };
    const updatedTodos = [...(milestone.todos || []), newTodoItem];
    saveMilestone({ ...milestone, todos: updatedTodos });
    setNewTodo('');
  };

  const handleDeleteTodo = (todoId: string) => {
    if (!milestone) return;
    const updatedTodos = milestone.todos?.filter(t => t.id !== todoId) || [];
    saveMilestone({ ...milestone, todos: updatedTodos });
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.task);
  };

  const saveEdit = () => {
    if (!milestone || !editingId) return;
    if (!editingText.trim()) {
      return;
    }
    const updatedTodos = milestone.todos?.map(t =>
      t.id === editingId ? { ...t, task: editingText.trim() } : t
    ) || [];
    saveMilestone({ ...milestone, todos: updatedTodos });
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  if (!milestone) return <View className="flex-1 bg-white" />;

  const completedCount = milestone.todos?.filter(t => t.completed).length || 0;
  const totalCount = milestone.todos?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white">
        <View>
          <Text className="font-black text-xl tracking-tighter">FOCUS SESSION</Text>
          <Text className="font-bold text-[10px] text-gray-400 tracking-[0.2em]">PRIORITY TASKS</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full">
          <Ionicons name="close" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="px-6 py-4 bg-gray-50">
        <Text className="font-bold text-xs text-gray-500 mb-2">MOMENTUM</Text>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View className="h-full bg-swiss-red" style={{ width: `${progress}%` }} />
        </View>
        <Text className="text-right text-[10px] font-bold text-gray-400 mt-1">
          {completedCount}/{totalCount} STEPS COMPLETE
        </Text>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 160 }}>
        {milestone.todos?.map((todo) => (
          <View
            key={todo.id}
            className={`flex-row items-start gap-4 mb-6 ${todo.completed && editingId !== todo.id ? 'opacity-50' : ''}`}
          >
            {/* Checkbox */}
            <TouchableOpacity
              onPress={() => handleToggleTodo(todo.id)}
              className={`w-6 h-6 rounded-lg border-2 items-center justify-center mt-0.5 ${todo.completed ? 'bg-black border-black' : 'border-gray-300 bg-white'
                }`}
            >
              {todo.completed && <Ionicons name="checkmark" size={16} color="white" />}
            </TouchableOpacity>

            {/* Content */}
            <View className="flex-1">
              {editingId === todo.id ? (
                <View className="flex-row gap-2">
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 font-bold text-sm"
                    autoFocus
                    onSubmitEditing={saveEdit}
                  />
                  <TouchableOpacity onPress={saveEdit} className="bg-black p-1 rounded">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEdit} className="bg-gray-200 p-1 rounded">
                    <Ionicons name="close" size={16} color="black" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleToggleTodo(todo.id)} onLongPress={() => startEditing(todo)}>
                  <Text className={`font-bold text-sm leading-5 ${todo.completed ? 'text-gray-400 line-through' : 'text-black'
                    }`}>
                    {todo.task}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Actions (only show if not editing) */}
            {editingId !== todo.id && (
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => startEditing(todo)}>
                  <Ionicons name="pencil" size={16} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTodo(todo.id)}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Add New Todo Input */}
        <View className="flex-row items-center gap-3 mt-2 mb-10">
          <View className="w-6 h-6 rounded-lg border-2 border-gray-200 border-dashed items-center justify-center">
            <Ionicons name="add" size={14} color="#D1D5DB" />
          </View>
          <TextInput
            value={newTodo}
            onChangeText={setNewTodo}
            placeholder="Add next step..."
            className="flex-1 font-bold text-sm py-2"
            onSubmitEditing={handleAddTodo}
          />
          {newTodo.length > 0 && (
            <TouchableOpacity onPress={handleAddTodo} className="bg-black px-3 py-1.5 rounded-full">
              <Text className="text-white text-xs font-bold">ADD</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* The Supervisor at the bottom */}
      <View className="absolute bottom-0 left-0 right-0 items-center">
        <BoatingSprite />
      </View>
    </KeyboardAvoidingView>
  );
}
