const { supabase } = require('../config/db');

class Department {
  static async create(data) {
    const { data: result, error } = await supabase
      .from('departments')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('departments')
      .select('*');
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  static async count() {
    const { count, error } = await supabase
      .from('departments')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return count;
  }
}

module.exports = Department;
