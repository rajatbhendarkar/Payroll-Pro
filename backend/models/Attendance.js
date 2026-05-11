const { supabase } = require('../config/db');

class Attendance {
  static async create(data) {
    const { data: result, error } = await supabase
      .from('attendance')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  static async findAll(filters = {}) {
    let query = supabase.from('attendance').select(`
      *,
      users(id, name, email, employee_id)
    `).order('date', { ascending: false });
    
    if (filters.employee_id) query = query.eq('employee_id', filters.employee_id);
    if (filters.startDate) query = query.gte('date', filters.startDate);
    if (filters.endDate) query = query.lte('date', filters.endDate);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async findOne(filters) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .match(filters)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async count(filters = {}) {
    let query = supabase.from('attendance').select('id', { count: 'exact', head: true });
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { count, error } = await query;
    if (error) throw error;
    return count;
  }
}

module.exports = Attendance;
