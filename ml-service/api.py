from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
import numpy as np
import joblib
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=['http://localhost:5000'])

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Global model variables
match_model = None
match_le_team = None
match_le_venue = None
match_meta = None
score_model = None
score_meta = None
sim_matrix = None
sim_scaler = None
xi_data = None
players_df = None
models_loaded = False

def load_models():
    global match_model, match_le_team, match_le_venue, match_meta
    global score_model, score_meta
    global sim_matrix, sim_scaler
    global xi_data, players_df, models_loaded

    try:
        # Match predictor
        match_model = joblib.load(f'{MODELS_DIR}/match_predictor.joblib')
        match_le_team = joblib.load(f'{MODELS_DIR}/team_encoder.joblib')
        match_le_venue = joblib.load(f'{MODELS_DIR}/venue_encoder.joblib')
        with open(f'{MODELS_DIR}/match_predictor_meta.json') as f:
            match_meta = json.load(f)
        print(f'✅ Match predictor loaded — accuracy: {match_meta["accuracy"]:.2%}')

        # Score predictor
        score_model = joblib.load(f'{MODELS_DIR}/score_predictor.joblib')
        with open(f'{MODELS_DIR}/score_predictor_meta.json') as f:
            score_meta = json.load(f)
        print(f'✅ Score predictor loaded — MAE: {score_meta["mae"]:.1f} runs')

        # Similarity engine
        sim_matrix = joblib.load(f'{MODELS_DIR}/similarity_matrix.joblib')
        sim_scaler = joblib.load(f'{MODELS_DIR}/similarity_scaler.joblib')
        print(f'✅ Similarity engine loaded — {sim_matrix.shape[0]} players')

        # XI optimizer
        xi_data = joblib.load(f'{MODELS_DIR}/xi_optimizer.joblib')
        print(f'✅ XI optimizer loaded — {len(xi_data["players"])} players')

        # Players index
        players_df = pd.read_csv(os.path.join(MODELS_DIR, 'players_index.csv'))
        if 'bowling_avg' in players_df.columns:
            players_df['bowling_avg'] = players_df['bowling_avg'].replace(999.0, 0)
        if 'bowling_sr' in players_df.columns:
            players_df['bowling_sr'] = players_df['bowling_sr'].replace(999.0, 0)
        print(f'✅ Players index loaded — {len(players_df)} players')

        models_loaded = True
        print('\n🎉 All models ready\n')

    except Exception as e:
        print(f'❌ Error loading models: {e}')
        raise e

def find_player(name):
    exact = players_df[players_df['player_name'].str.lower() == name.lower()]
    if not exact.empty:
        return exact.iloc[0], exact.index[0]
    partial = players_df[players_df['player_name'].str.contains(name, case=False, na=False)]
    if not partial.empty:
        return partial.iloc[0], partial.index[0]
    return None, None

COUNTRY_MAP = {
    'India': 'India', 'Australia': 'Australia',
    'England': 'England', 'Pakistan': 'Pakistan',
    'South Africa': 'South Africa', 'New Zealand': 'New Zealand',
    'West Indies': 'West Indies', 'Sri Lanka': 'Sri Lanka',
    'Bangladesh': 'Bangladesh', 'Zimbabwe': 'Zimbabwe'
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'models_loaded': models_loaded,
        'players_count': len(players_df) if players_df is not None else 0
    }), 200

@app.route('/predict/match', methods=['POST'])
def predict_match():
    try:
        data = request.get_json()
        team1 = data.get('team1')
        team2 = data.get('team2')
        venue = data.get('venue', '')
        toss_winner = data.get('toss_winner', team1)
        toss_decision = data.get('toss_decision', 'bat')

        for field, val in [('team1', team1), ('team2', team2)]:
            if not val:
                return jsonify({'error': f'Missing: {field}'}), 400

        # Encode teams
        try:
            t1 = int(match_le_team.transform([team1])[0])
            t2 = int(match_le_team.transform([team2])[0])
        except ValueError:
            return jsonify({'error': f'Unknown team. Known teams: {list(match_le_team.classes_)}'}), 400

        # Encode venue with fallback
        try:
            v = int(match_le_venue.transform([venue])[0])
        except ValueError:
            v = int(match_le_venue.transform([match_meta['known_venues'][0]])[0])

        toss_is_team1 = 1 if toss_winner == team1 else 0
        decision_bat = 1 if toss_decision == 'bat' else 0
        team1_home = 1 if COUNTRY_MAP.get(team1, '') in venue else 0

        features = pd.DataFrame([[t1, t2, v, toss_is_team1, decision_bat, team1_home]],
                                  columns=match_meta['feature_cols'])

        proba = match_model.predict_proba(features)[0]
        team1_win = float(proba[1])
        team2_win = float(proba[0]) * 0.65
        draw = float(proba[0]) * 0.35

        return jsonify({
            f'{team1}_win_prob': round(team1_win, 3),
            f'{team2}_win_prob': round(team2_win, 3),
            'draw_prob': round(draw, 3),
            'confidence': round(float(max(proba)), 3)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/score', methods=['POST'])
def predict_score():
    try:
        data = request.get_json()
        player_name = data.get('player_name')
        venue = data.get('venue', '')
        innings_num = int(data.get('innings_num', 1))

        if not player_name:
            return jsonify({'error': 'Missing: player_name'}), 400

        player, _ = find_player(player_name)
        if player is None:
            return jsonify({'error': f'Player not found: {player_name}'}), 404

        difficulty = {1: 1.0, 2: 0.95, 3: 0.90, 4: 0.85}.get(innings_num, 0.90)
        venue_avg = score_meta.get('venue_avg_default', 31.1)
        std_dev = score_meta['std_dev']

        features = pd.DataFrame([[
            float(player['batting_avg']),
            float(player['strike_rate']),
            float(player['hundreds']),
            venue_avg,
            difficulty
        ]], columns=score_meta['feature_cols'])

        pred = float(score_model.predict(features)[0])

        return jsonify({
            'player': player['player_name'],
            'innings': innings_num,
            'predicted_min': int(max(0, pred - std_dev * 0.8)),
            'predicted_median': int(max(0, pred)),
            'predicted_max': int(pred + std_dev * 0.8),
            'confidence': round(score_meta['r2'], 3)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/xi', methods=['POST'])
def predict_xi():
    try:
        data = request.get_json()
        squad_names = data.get('squad', [])
        conditions = data.get('conditions', 'balanced')

        if len(squad_names) < 11:
            return jsonify({'error': 'Need at least 11 players in squad'}), 400

        weights = xi_data['condition_weights'].get(
            conditions, xi_data['condition_weights']['balanced']
        )
        all_players = pd.DataFrame(xi_data['players'])

        squad = all_players[all_players['player_name'].isin(squad_names)].copy()

        # Try partial match for unmatched names
        matched = set(squad['player_name'].tolist())
        for name in squad_names:
            if name not in matched:
                partial = all_players[
                    all_players['player_name'].str.contains(name, case=False, na=False)
                ]
                if not partial.empty:
                    squad = pd.concat([squad, partial.iloc[[0]]])

        if len(squad) < 11:
            return jsonify({'error': f'Only {len(squad)} players found in database'}), 400

        squad['overall_score'] = (
            squad['bat_score'] * weights['bat'] +
            squad['bowl_score'] * weights['bowl']
        )

        IDEAL = {'batsman': 5, 'allrounder': 2, 'bowler': 4}
        selected = []
        composition = {'batsman': 0, 'allrounder': 0, 'bowler': 0}
        squad_sorted = squad.sort_values('overall_score', ascending=False)

        for _, player in squad_sorted.iterrows():
            role = player['role']
            if composition.get(role, 0) < IDEAL.get(role, 0) and len(selected) < 11:
                selected.append(player)
                composition[role] = composition.get(role, 0) + 1

        for _, player in squad_sorted.iterrows():
            if len(selected) >= 11:
                break
            if player['player_name'] not in [p['player_name'] for p in selected]:
                selected.append(player)

        selected_df = pd.DataFrame(selected[:11])

        return jsonify({
            'conditions': conditions,
            'composition': composition,
            'recommended_xi': [
                {
                    'player': row['player_name'],
                    'role': row['role'],
                    'overall_score': round(float(row['overall_score']), 1),
                    'batting_avg': round(float(row['batting_avg']), 1),
                    'wickets': int(row['wickets'])
                }
                for _, row in selected_df.iterrows()
            ]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/similar-players', methods=['POST'])
def similar_players():
    try:
        data = request.get_json()
        player_name = data.get('player_name')

        if not player_name:
            return jsonify({'error': 'Missing: player_name'}), 400

        player, idx = find_player(player_name)
        if player is None:
            return jsonify({'error': f'Player not found: {player_name}'}), 404

        scores = list(enumerate(sim_matrix[idx]))
        scores = sorted(scores, key=lambda x: x[1], reverse=True)
        scores = scores[1:6]

        similar = []
        for i, score in scores:
            p = players_df.iloc[i]
            similar.append({
                'player': p['player_name'],
                'similarity_score': round(float(score), 3),
                'batting_avg': round(float(p['batting_avg']), 1),
                'wickets': int(p['wickets'])
            })

        return jsonify({
            'player': player['player_name'],
            'similar_players': similar
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print('=' * 50)
    print('Test Cricket Universe — ML Service')
    print('=' * 50)
    load_models()
    port = int(os.getenv('PORT', 5001))
    print(f'Starting on port {port}...')
    app.run(host='0.0.0.0', port=port, debug=False)