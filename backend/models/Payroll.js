const { supabase } = require('../config/db');

class Payroll {
  static async create(data) {
    const { data: result, error } = await supabase
      .from('payroll')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  static async findAll(filters = {}) {
    let query = supabase.from('payroll').select(`
      *,
      users(id, name, email, employee_id)
    `).order('year', { ascending: false }).order('month', { ascending: false });
    
    if (filters.employee_id) query = query.eq('employee_id', filters.employee_id);
    if (filters.month) query = query.eq('month', filters.month);
    if (filters.year) query = query.eq('year', filters.year);
    if (filters.status) query = query.eq('status', filters.status);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('payroll')
      .select(`
        *,
        users(id, name, email, employee_id)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async findOne(filters) {
    const { data, error } = await supabase
      .from('payroll')
      .select(`
        *,
        users(id, name, email, employee_id)
      `)
      .match(filters)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('payroll')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async count(filters = {}) {
    let query = supabase.from('payroll').select('id', { count: 'exact', head: true });
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { count, error } = await query;
    if (error) throw error;
    return count;
  }
}

module.exports = Payroll;
