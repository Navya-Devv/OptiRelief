from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sqlite3
import json
from datetime import datetime
import random
from typing import List, Dict, Any, Optional
import heapq
import networkx as nx
import numpy as np

app = FastAPI(title="OptiRelief API", description="Smart Resource Distribution for Disaster Relief")

# Enable CORS
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
  "http://localhost:5173",
  "https://navya-devv.github.io/OptiRelief",
  
],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database initialization
def init_database():
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS affected_areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            severity INTEGER NOT NULL,
            population INTEGER NOT NULL,
            delay_time INTEGER NOT NULL,
            urgency_score REAL DEFAULT 0
        );
        
        CREATE TABLE IF NOT EXISTS volunteers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            skills TEXT NOT NULL,
            location TEXT NOT NULL,
            status TEXT DEFAULT 'available',
            assigned_to TEXT
        );
        
        CREATE TABLE IF NOT EXISTS supply_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL,
            weight INTEGER NOT NULL,
            utility INTEGER NOT NULL,
            quantity INTEGER NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            source TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            urgency_score INTEGER DEFAULT 0,
            urgency_level TEXT DEFAULT 'low',
            keywords_found TEXT
        );
        
        CREATE TABLE IF NOT EXISTS location_graph (
            from_loc TEXT,
            to_loc TEXT,
            distance INTEGER,
            PRIMARY KEY (from_loc, to_loc)
        );
        
        CREATE TABLE IF NOT EXISTS dispatch_centers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        );
    ''')
    
    # Insert sample data
    sample_areas = [
        ('Downtown District', 8, 50000, 2),
        ('Riverside Community', 6, 25000, 4),
        ('Industrial Zone', 9, 15000, 1),
        ('Suburban Area', 4, 80000, 6),
        ('Mountain Village', 7, 5000, 8)
    ]
    
    sample_volunteers = [
        ('Alice Johnson', 'Medical, First Aid', 'Downtown', 'available'),
        ('Bob Smith', 'Search and Rescue, Engineering', 'Riverside', 'available'),
        ('Carol Davis', 'Communications, Logistics', 'Industrial', 'available'),
        ('David Wilson', 'Medical, Psychology', 'Suburban', 'available'),
        ('Eve Brown', 'Engineering, Technical', 'Mountain', 'available'),
        ('Frank Miller', 'Logistics, Transportation', 'Downtown', 'available')
    ]
    
    sample_supplies = [
        ('Water Bottles', 2, 9, 100),
        ('Medical Kit', 5, 10, 20),
        ('Blankets', 3, 7, 50),
        ('Food Rations', 4, 8, 75),
        ('Flashlights', 1, 6, 40),
        ('Radio Equipment', 8, 9, 10),
        ('Tents', 15, 8, 15),
        ('Batteries', 1, 5, 200)
    ]
    
    sample_locations = [
        ('A', 'B', 10),
        ('A', 'C', 15),
        ('B', 'C', 12),
        ('B', 'D', 8),
        ('C', 'D', 20),
        ('C', 'E', 18),
        ('D', 'E', 6),
        ('E', 'F', 14),
        ('F', 'A', 25)
    ]
    
    sample_centers = [
        ('center_a', 'Emergency Response Center A', 40.7128, -74.0060),
        ('center_b', 'Relief Distribution Hub B', 40.7614, -73.9776),
        ('center_c', 'Medical Support Base C', 40.6892, -74.0445),
        ('center_d', 'Logistics Center D', 40.7489, -73.9857),
        ('center_e', 'Command Post E', 40.7282, -74.0776)
    ]
    
    cursor.executemany('INSERT OR IGNORE INTO affected_areas (name, severity, population, delay_time) VALUES (?, ?, ?, ?)', sample_areas)
    cursor.executemany('INSERT OR IGNORE INTO volunteers (name, skills, location, status) VALUES (?, ?, ?, ?)', sample_volunteers)
    cursor.executemany('INSERT OR IGNORE INTO supply_items (item_name, weight, utility, quantity) VALUES (?, ?, ?, ?)', sample_supplies)
    cursor.executemany('INSERT OR IGNORE INTO location_graph (from_loc, to_loc, distance) VALUES (?, ?, ?)', sample_locations)
    cursor.executemany('INSERT OR IGNORE INTO dispatch_centers (id, name, latitude, longitude) VALUES (?, ?, ?, ?)', sample_centers)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

# Algorithm Implementations

def merge_sort_priority(areas):
    """Merge Sort implementation for priority sorting"""
    if len(areas) <= 1:
        return areas
    
    mid = len(areas) // 2
    left = merge_sort_priority(areas[:mid])
    right = merge_sort_priority(areas[mid:])
    
    return merge(left, right)

def merge(left, right):
    """Merge function for merge sort"""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        # Calculate urgency scores
        left_score = calculate_urgency_score(left[i])
        right_score = calculate_urgency_score(right[j])
        
        if left_score >= right_score:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

def calculate_urgency_score(area):
    """Calculate urgency score based on severity, population, and delay"""
    severity_weight = 40
    population_weight = 30
    delay_weight = 30
    
    # Normalize values
    severity_normalized = area['severity'] / 10
    population_normalized = min(area['population'] / 100000, 1)
    delay_normalized = min(area['delay_time'] / 24, 1)
    
    score = (severity_normalized * severity_weight + 
             population_normalized * population_weight + 
             delay_normalized * delay_weight)
    
    return score

def dijkstra_shortest_path(graph, start, end):
    """Dijkstra's algorithm for shortest path"""
    if start == end:
        return [start], 0
    
    distances = {node: float('infinity') for node in graph.nodes()}
    distances[start] = 0
    previous = {}
    unvisited = list(graph.nodes())
    
    while unvisited:
        current = min(unvisited, key=lambda node: distances[node])
        if distances[current] == float('infinity'):
            break
            
        unvisited.remove(current)
        
        if current == end:
            path = []
            while current in previous:
                path.append(current)
                current = previous[current]
            path.append(start)
            return path[::-1], distances[end]
        
        for neighbor in graph.neighbors(current):
            if neighbor in unvisited:
                edge_weight = graph[current][neighbor].get('weight', 1)
                new_distance = distances[current] + edge_weight
                
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    previous[neighbor] = current
    
    return None, float('infinity')

def knapsack_01(items, capacity):
    """0/1 Knapsack dynamic programming solution"""
    n = len(items)
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            weight = items[i-1]['weight']
            utility = items[i-1]['utility']
            
            if weight <= w:
                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight] + utility)
            else:
                dp[i][w] = dp[i-1][w]
    
    # Backtrack to find selected items
    selected_items = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i-1][w]:
            selected_items.append(items[i-1])
            w -= items[i-1]['weight']
    
    return selected_items, dp[n][capacity]

def boyer_moore_search(text, pattern):
    """Boyer-Moore string matching algorithm"""
    def build_bad_char_table(pattern):
        table = {}
        for i in range(len(pattern)):
            table[pattern[i]] = i
        return table
    
    text = text.lower()
    pattern = pattern.lower()
    bad_char_table = build_bad_char_table(pattern)
    
    matches = []
    m = len(pattern)
    n = len(text)
    s = 0
    
    while s <= n - m:
        j = m - 1
        
        while j >= 0 and pattern[j] == text[s + j]:
            j -= 1
        
        if j < 0:
            matches.append(s)
            s += (m - bad_char_table.get(text[s + m], -1) - 1) if s + m < n else 1
        else:
            s += max(1, j - bad_char_table.get(text[s + j], -1))
    
    return matches

def floyd_warshall(graph_matrix):
    """Floyd-Warshall algorithm for all-pairs shortest paths"""
    n = len(graph_matrix)
    dist = [row[:] for row in graph_matrix]  # Deep copy
    
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    
    return dist

def backtrack_volunteer_assignment(volunteers, regions):
    """Backtracking algorithm for volunteer assignment"""
    assignments = []
    used_volunteers = set()
    
    def can_assign(volunteer, region):
        # Simple matching logic based on skills and location
        if volunteer['id'] in used_volunteers:
            return False
        
        skills = volunteer['skills'].lower()
        location = volunteer['location'].lower()
        region_lower = region.lower()
        
        # Calculate match score
        skill_match = 0
        if 'medical' in skills and ('medical' in region_lower or 'hospital' in region_lower):
            skill_match += 30
        if 'rescue' in skills and ('rescue' in region_lower or 'emergency' in region_lower):
            skill_match += 30
        if 'engineering' in skills and ('engineering' in region_lower or 'technical' in region_lower):
            skill_match += 25
        if 'logistics' in skills:
            skill_match += 20
        
        # Location proximity bonus
        if location in region_lower or region_lower in location:
            skill_match += 20
        
        return skill_match >= 40
    
    def backtrack(region_idx):
        if region_idx >= len(regions):
            return True
        
        region = regions[region_idx]
        
        for volunteer in volunteers:
            if can_assign(volunteer, region):
                match_score = calculate_match_score(volunteer, region)
                assignments.append({
                    'volunteer': volunteer,
                    'region': region,
                    'match_score': match_score
                })
                used_volunteers.add(volunteer['id'])
                
                if backtrack(region_idx + 1):
                    return True
                
                assignments.pop()
                used_volunteers.remove(volunteer['id'])
        
        # Try to continue without assigning anyone to this region
        return backtrack(region_idx + 1)
    
    def calculate_match_score(volunteer, region):
        skills = volunteer['skills'].lower()
        location = volunteer['location'].lower()
        region_lower = region.lower()
        
        score = 50  # Base score
        
        if 'medical' in skills:
            score += 20
        if 'rescue' in skills:
            score += 15
        if 'engineering' in skills:
            score += 10
        if location in region_lower:
            score += 15
        
        return min(score, 100)
    
    backtrack(0)
    return assignments

# API Endpoints

@app.get("/")
async def root():
    return {"message": "OptiRelief API - Smart Resource Distribution for Disaster Relief"}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    stats = {
        'totalRequests': cursor.execute('SELECT COUNT(*) FROM requests').fetchone()[0],
        'activeVolunteers': cursor.execute('SELECT COUNT(*) FROM volunteers WHERE status = "available"').fetchone()[0],
        'deliveriesInProgress': random.randint(5, 15),
        'resolvedCases': random.randint(20, 50)
    }
    
    conn.close()
    return stats

@app.get("/api/dashboard/request-types")
async def get_request_types():
    return [
        {'name': 'Medical', 'value': 35},
        {'name': 'Food/Water', 'value': 28},
        {'name': 'Shelter', 'value': 22},
        {'name': 'Transportation', 'value': 15}
    ]

@app.get("/api/dashboard/priority-distribution")
async def get_priority_distribution():
    return [
        {'priority': 'Critical', 'count': 8},
        {'priority': 'High', 'count': 15},
        {'priority': 'Medium', 'count': 22},
        {'priority': 'Low', 'count': 12}
    ]

@app.get("/api/areas")
async def get_areas():
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name, severity, population, delay_time, urgency_score FROM affected_areas')
    areas = []
    
    for row in cursor.fetchall():
        area = {
            'id': row[0],
            'name': row[1],
            'severity': row[2],
            'population': row[3],
            'delay_time': row[4],
            'urgency_score': row[5]
        }
        areas.append(area)
    
    conn.close()
    return areas

@app.post("/api/areas")
async def add_area(area_data: dict):
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO affected_areas (name, severity, population, delay_time) VALUES (?, ?, ?, ?)',
        (area_data['name'], area_data['severity'], area_data['population'], area_data['delay_time'])
    )
    
    conn.commit()
    conn.close()
    return {"message": "Area added successfully"}

@app.post("/api/sort-priority")
async def sort_priority():
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name, severity, population, delay_time FROM affected_areas')
    areas = []
    
    for row in cursor.fetchall():
        area = {
            'id': row[0],
            'name': row[1],
            'severity': row[2],
            'population': row[3],
            'delay_time': row[4]
        }
        areas.append(area)
    
    # Sort using merge sort
    sorted_areas = merge_sort_priority(areas)
    
    # Update urgency scores in database
    for area in sorted_areas:
        urgency_score = calculate_urgency_score(area)
        cursor.execute(
            'UPDATE affected_areas SET urgency_score = ? WHERE id = ?',
            (urgency_score, area['id'])
        )
        area['urgency_score'] = urgency_score
    
    conn.commit()
    conn.close()
    
    return sorted_areas

@app.get("/api/locations")
async def get_locations():
    # Mock location data
    locations = [
        {'id': 'A', 'name': 'Emergency Center A', 'coordinates': [40.7128, -74.0060]},
        {'id': 'B', 'name': 'Relief Hub B', 'coordinates': [40.7614, -73.9776]},
        {'id': 'C', 'name': 'Medical Base C', 'coordinates': [40.6892, -74.0445]},
        {'id': 'D', 'name': 'Supply Depot D', 'coordinates': [40.7489, -73.9857]},
        {'id': 'E', 'name': 'Command Post E', 'coordinates': [40.7282, -74.0776]},
        {'id': 'F', 'name': 'Distribution Point F', 'coordinates': [40.7505, -73.9934]}
    ]
    return locations

@app.get("/api/shortest-route")
async def get_shortest_route(start: str = None, end: str = None):
    if not start or not end:
        raise HTTPException(status_code=400, detail="Start and end locations required")
    
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    # Build graph
    cursor.execute('SELECT from_loc, to_loc, distance FROM location_graph')
    edges = cursor.fetchall()
    
    G = nx.Graph()
    for from_loc, to_loc, distance in edges:
        G.add_edge(from_loc, to_loc, weight=distance)
    
    conn.close()
    
    try:
        path, distance = dijkstra_shortest_path(G, start, end)
        
        if path is None:
            raise HTTPException(status_code=404, detail="No route found")
        
        # Create steps
        steps = []
        for i in range(len(path) - 1):
            edge_weight = G[path[i]][path[i+1]]['weight']
            steps.append({
                'from': path[i],
                'to': path[i+1],
                'distance': edge_weight
            })
        
        return {
            'path': path,
            'total_distance': int(distance),
            'estimated_time': int(distance * 5),  # Assume 5 min per unit
            'steps': steps
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/supply-items")
async def get_supply_items():
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, item_name, weight, utility, quantity FROM supply_items')
    items = []
    
    for row in cursor.fetchall():
        items.append({
            'id': row[0],
            'item_name': row[1],
            'weight': row[2],
            'utility': row[3],
            'quantity': row[4]
        })
    
    conn.close()
    return items

@app.post("/api/supply-items")
async def add_supply_item(item_data: dict):
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO supply_items (item_name, weight, utility, quantity) VALUES (?, ?, ?, ?)',
        (item_data['item_name'], item_data['weight'], item_data['utility'], item_data['quantity'])
    )
    
    conn.commit()
    conn.close()
    return {"message": "Supply item added successfully"}

@app.post("/api/optimize-supply")
async def optimize_supply(request_data: dict):
    items = request_data['items']
    capacity = request_data['capacity']
    
    selected_items, total_utility = knapsack_01(items, capacity)
    
    total_weight = sum(item['weight'] for item in selected_items)
    efficiency = (total_utility / sum(item['utility'] for item in items)) * 100 if items else 0
    
    return {
        'selected_items': selected_items,
        'total_weight': total_weight,
        'total_utility': total_utility,
        'efficiency': efficiency
    }

@app.get("/api/volunteers")
async def get_volunteers():
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name, skills, location, status, assigned_to FROM volunteers')
    volunteers = []
    
    for row in cursor.fetchall():
        volunteers.append({
            'id': row[0],
            'name': row[1],
            'skills': row[2],
            'location': row[3],
            'status': row[4],
            'assigned_to': row[5]
        })
    
    conn.close()
    return volunteers

@app.get("/api/regions")
async def get_regions():
    return [
        'Downtown Emergency Zone',
        'Riverside Medical Area', 
        'Industrial Rescue Zone',
        'Suburban Relief Center',
        'Mountain Village Outpost'
    ]

@app.post("/api/assign-volunteers")
async def assign_volunteers():
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name, skills, location, status FROM volunteers WHERE status = "available"')
    volunteers = []
    
    for row in cursor.fetchall():
        volunteers.append({
            'id': row[0],
            'name': row[1],
            'skills': row[2],
            'location': row[3],
            'status': row[4]
        })
    
    regions = [
        'Downtown Emergency Zone',
        'Riverside Medical Area', 
        'Industrial Rescue Zone',
        'Suburban Relief Center'
    ]
    
    assignments = backtrack_volunteer_assignment(volunteers, regions)
    
    total_coverage = (len(assignments) / len(regions)) * 100 if regions else 0
    unassigned_volunteers = len(volunteers) - len(assignments)
    
    conn.close()
    
    return {
        'assignments': assignments,
        'total_coverage': int(total_coverage),
        'unassigned_volunteers': unassigned_volunteers
    }

@app.get("/api/messages")
async def get_messages():
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, message, source, timestamp, urgency_score, urgency_level, keywords_found FROM requests ORDER BY urgency_score DESC')
    messages = []
    
    for row in cursor.fetchall():
        keywords = json.loads(row[6]) if row[6] else []
        messages.append({
            'id': row[0],
            'message': row[1],
            'source': row[2],
            'timestamp': row[3],
            'urgency_score': row[4],
            'urgency_level': row[5],
            'keywords_found': keywords
        })
    
    conn.close()
    return messages

@app.post("/api/analyze-message")
async def analyze_message(request_data: dict):
    message = request_data['message']
    source = request_data['source']
    
    urgent_keywords = [
        'urgent', 'emergency', 'help', 'critical', 'injured', 'trapped',
        'fire', 'flood', 'collapse', 'medical', 'rescue', 'immediate',
        'danger', 'severe', 'casualty', 'ambulance', 'hospital'
    ]
    
    found_keywords = []
    urgency_score = 0
    
    for keyword in urgent_keywords:
        matches = boyer_moore_search(message, keyword)
        if matches:
            found_keywords.append(keyword)
            urgency_score += len(matches) * 10
    
    # Cap the score at 100
    urgency_score = min(urgency_score, 100)
    
    # Determine urgency level
    if urgency_score >= 80:
        urgency_level = 'Critical'
    elif urgency_score >= 60:
        urgency_level = 'High'
    elif urgency_score >= 40:
        urgency_level = 'Medium'
    else:
        urgency_level = 'Low'
    
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO requests (message, source, urgency_score, urgency_level, keywords_found) VALUES (?, ?, ?, ?, ?)',
        (message, source, urgency_score, urgency_level, json.dumps(found_keywords))
    )
    
    message_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        'id': message_id,
        'message': message,
        'source': source,
        'timestamp': datetime.now().isoformat(),
        'urgency_score': urgency_score,
        'urgency_level': urgency_level,
        'keywords_found': found_keywords
    }

@app.get("/api/dispatch-centers")
async def get_dispatch_centers():
    conn = sqlite3.connect('optirelief.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name, latitude, longitude FROM dispatch_centers')
    centers = []
    
    for row in cursor.fetchall():
        centers.append({
            'id': row[0],
            'name': row[1],
            'coordinates': [row[2], row[3]]
        })
    
    conn.close()
    return centers

@app.post("/api/multi-dispatch")
async def multi_dispatch(request_data: dict):
    selected_centers = request_data['centers']
    
    if len(selected_centers) < 2:
        raise HTTPException(status_code=400, detail="At least 2 centers required")
    
    # Create distance matrix (mock data for demonstration)
    n = len(selected_centers)
    INF = float('inf')
    
    # Generate mock distance matrix
    distance_matrix = []
    for i in range(n):
        row = []
        for j in range(n):
            if i == j:
                row.append(0)
            else:
                # Generate consistent random distances
                distance = abs(hash(f"{selected_centers[i]}{selected_centers[j]}")) % 50 + 10
                row.append(distance)
        distance_matrix.append(row)
    
    # Apply Floyd-Warshall
    result_matrix = floyd_warshall(distance_matrix)
    
    # Generate optimal routes
    optimal_routes = []
    for i in range(n):
        for j in range(n):
            if i != j:
                optimal_routes.append({
                    'from': selected_centers[i],
                    'to': selected_centers[j],
                    'cost': result_matrix[i][j],
                    'path': [selected_centers[i], selected_centers[j]]  # Simplified path
                })
    
    total_cost = sum(route['cost'] for route in optimal_routes)
    
    # Generate dispatch plans
    dispatch_plan = []
    for i, center in enumerate(selected_centers):
        destinations = [selected_centers[j] for j in range(n) if i != j]
        total_time = sum(result_matrix[i][j] for j in range(n) if i != j) * 5  # 5 min per unit
        
        dispatch_plan.append({
            'center': center,
            'destinations': destinations,
            'total_time': int(total_time)
        })
    
    return {
        'cost_matrix': result_matrix,
        'optimal_routes': optimal_routes,
        'total_cost': total_cost,
        'dispatch_plan': dispatch_plan
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)