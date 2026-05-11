const { supabase } = require('../config/db');

class Announcement {
  static async create(data) {
    const { data: result, error } = await supabase
      .from('announcements')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        users(id, name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        users(id, name)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

module.exports = Announcement;
