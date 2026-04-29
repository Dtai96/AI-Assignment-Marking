import { useState } from "react";

interface RubricItem {
  id: string;
  title: string;
  maxPoints: number;
  criteria: CriteriaItem[];
}

interface CriteriaItem {
  id: string;
  description: string;
  maxPoints: number;
}

interface RubricAccordionProps {
  value: string;
  onChange: (value: string) => void;
}

// Parse rubric text into structured data
function parseRubric(text: string): RubricItem[] {
  if (!text.trim()) return [];
  
  const items: RubricItem[] = [];
  const lines = text.split('\n');
  let currentItem: RubricItem | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Match section header: ### 1. Task Response (0-30 points)
    const headerMatch = trimmed.match(/^###\s+\d+\.\s+(.+?)\s*\(0-(\d+)\s*points?\)/);
    if (headerMatch) {
      if (currentItem) {
        items.push(currentItem);
      }
      currentItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        title: headerMatch[1],
        maxPoints: parseInt(headerMatch[2]),
        criteria: []
      };
      continue;
    }
    
    // Match criteria: - Addressing all parts... (up to 12 points).
    const criteriaMatch = trimmed.match(/^-\s+(.+?)\s*\(up to\s+(\d+)\s*points?\)/);
    if (criteriaMatch && currentItem) {
      currentItem.criteria.push({
        id: `criteria-${Date.now()}-${Math.random()}`,
        description: criteriaMatch[1],
        maxPoints: parseInt(criteriaMatch[2])
      });
    }
  }
  
  if (currentItem) {
    items.push(currentItem);
  }
  
  return items;
}

// Convert structured data back to rubric text
function serializeRubric(items: RubricItem[]): string {
  if (items.length === 0) return '';
  
  const lines: string[] = [];
  
  items.forEach((item, index) => {
    lines.push(`### ${index + 1}. ${item.title} (0-${item.maxPoints} points)`);
    lines.push('Award points based on:');
    
    item.criteria.forEach(criteria => {
      lines.push(`- ${criteria.description} (up to ${criteria.maxPoints} points).`);
    });
    
    lines.push(''); // Empty line between sections
  });
  
  return lines.join('\n');
}

export default function RubricAccordion({ value, onChange }: RubricAccordionProps) {
  const [rubricItems, setRubricItems] = useState<RubricItem[]>(() => parseRubric(value));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addItem = () => {
    const newItem: RubricItem = {
      id: `item-${Date.now()}`,
      title: 'New Section',
      maxPoints: 30,
      criteria: [
        {
          id: `criteria-${Date.now()}`,
          description: 'New criterion',
          maxPoints: 10
        }
      ]
    };
    const updated = [...rubricItems, newItem];
    setRubricItems(updated);
    setExpandedItems(new Set([...expandedItems, newItem.id]));
    onChange(serializeRubric(updated));
  };

  const updateItem = (id: string, updates: Partial<RubricItem>) => {
    const updated = rubricItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setRubricItems(updated);
    onChange(serializeRubric(updated));
  };

  const deleteItem = (id: string) => {
    const updated = rubricItems.filter(item => item.id !== id);
    setRubricItems(updated);
    onChange(serializeRubric(updated));
  };

  const addCriterion = (itemId: string) => {
    const updated = rubricItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          criteria: [
            ...item.criteria,
            {
              id: `criteria-${Date.now()}`,
              description: 'New criterion',
              maxPoints: 10
            }
          ]
        };
      }
      return item;
    });
    setRubricItems(updated);
    onChange(serializeRubric(updated));
  };

  const updateCriterion = (itemId: string, criteriaId: string, updates: Partial<CriteriaItem>) => {
    const updated = rubricItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          criteria: item.criteria.map(c =>
            c.id === criteriaId ? { ...c, ...updates } : c
          )
        };
      }
      return item;
    });
    setRubricItems(updated);
    onChange(serializeRubric(updated));
  };

  const deleteCriterion = (itemId: string, criteriaId: string) => {
    const updated = rubricItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          criteria: item.criteria.filter(c => c.id !== criteriaId)
        };
      }
      return item;
    });
    setRubricItems(updated);
    onChange(serializeRubric(updated));
  };

  if (rubricItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
        <p>No rubric sections yet. Click "Add Section" to create one.</p>
        <button className="btn-primary" onClick={addItem} style={{ marginTop: '12px' }}>
          Add Section
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {rubricItems.map((item, index) => (
        <div
          key={item.id}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--bg-surface)',
            overflow: 'hidden'
          }}
        >
          {/* Accordion Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-secondary)',
              cursor: 'pointer',
              gap: '12px'
            }}
            onClick={() => toggleItem(item.id)}
          >
            <span style={{ fontSize: '1.2rem', transform: expandedItems.has(item.id) ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              ▶
            </span>
            <span style={{ fontWeight: 600, flex: 1 }}>
              {index + 1}. {item.title}
            </span>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
              (0-{item.maxPoints} points)
            </span>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
            >
              Delete
            </button>
          </div>

          {/* Accordion Content */}
          {expandedItems.has(item.id) && (
            <div style={{ padding: '16px' }}>
              {/* Section Title Editor */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Section Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, { title: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
              </div>

              {/* Max Points Editor */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Max Points</label>
                <input
                  type="number"
                  value={item.maxPoints}
                  onChange={(e) => updateItem(item.id, { maxPoints: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={{ width: '100px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
              </div>

              {/* Criteria List */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
                  Criteria
                </label>
                
                {item.criteria.map((criteria, cIndex) => (
                  <div
                    key={criteria.id}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '8px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', paddingTop: '8px' }}>{cIndex + 1}.</span>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={criteria.description}
                        onChange={(e) => updateCriterion(item.id, criteria.id, { description: e.target.value })}
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '4px' }}
                        placeholder="Criterion description"
                      />
                      <input
                        type="number"
                        value={criteria.maxPoints}
                        onChange={(e) => updateCriterion(item.id, criteria.id, { maxPoints: parseInt(e.target.value) || 0 })}
                        min="0"
                        style={{ width: '100px', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.875rem' }}
                        placeholder="Max points"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>points</span>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--danger)' }}
                      onClick={() => deleteCriterion(item.id, criteria.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', marginTop: '8px' }}
                  onClick={() => addCriterion(item.id)}
                >
                  + Add Criterion
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        className="btn-primary"
        onClick={addItem}
        style={{ marginTop: '8px' }}
      >
        + Add Section
      </button>
    </div>
  );
}
