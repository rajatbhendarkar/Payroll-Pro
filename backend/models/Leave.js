const { supabase } = require('../config/db');

class Leave {
  static async create(data) {
    const { data: result, error } = await supabase
      .from('leaves')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  static async findAll(filters = {}) {
    let query = supabase.from('leaves').select(`
      *,
      users!leaves_employee_id_fkey(id, name, email, employee_id),
      approver:users!leaves_approved_by_fkey(id, name)
    `).order('created_at', { ascending: false });
    
    if (filters.employee_id) query = query.eq('employee_id', filters.employee_id);
    if (filters.status) query = query.eq('status', filters.status);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('leaves')
      .select(`
        *,
        users!leaves_employee_id_fkey(id, name, email, employee_id),
        approver:users!leaves_approved_by_fkey(id, name)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('leaves')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase.from('leaves').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  static async count(filters = {}) {
    let query = supabase.from('leaves').select('id', { count: 'exact', head: true });
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { count, error } = await query;
    if (error) throw error;
    return count;
  }
}

module.exports = Leave;
