#!/usr/bin/env python3
"""
Prune expired events from local-events.json.
Removes events where the published date is before today.
"""

import json
import sys
from datetime import datetime, timezone

def prune_expired_events(json_path):
    with open(json_path) as f:
        data = json.load(f)

    today = datetime.now(timezone.utc).date()
    
    original_count = len(data['events'])
    
    # Filter out expired events
    remaining = []
    removed = []
    for e in data['events']:
        event_date = datetime.fromisoformat(e['published']).date()
        if event_date < today:
            removed.append(f"{e['title']} @ {e['venue']} ({e['published']})")
        else:
            remaining.append(e)
    
    if not removed:
        print(f"No expired events. {original_count} events remain.")
        return
    
    # Update the data
    data['events'] = remaining
    data['total'] = len(remaining)
    data['generated'] = datetime.now(timezone.utc).isoformat()
    
    # Write back
    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Pruned {len(removed)} expired events. {len(remaining)} remain.")
    for r in removed:
        print(f"  - {r}")

if __name__ == '__main__':
    json_path = sys.argv[1] if len(sys.argv) > 1 else 'src/app/data/local-events.json'
    prune_expired_events(json_path)