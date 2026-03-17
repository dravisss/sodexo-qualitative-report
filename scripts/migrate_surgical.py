import json

rawState = json.load(open('./backups/kanban/kanban_state_before_migration.json'))

newState = {
    '_columnOrder': {
        'backlog': [],
        'doing': [],
        'blocked': [],
        'done': []
    }
}

# Mapa restrito APENAS para os cards antigos de FEVEREIRO
old_to_new = {
    "I-01": "I-01",
    "I-02": "I-02",
    "I-03": "I-03",
    "I-04": "I-04",
    "I-05": "I-10",
    "I-06": "I-08",
    "I-07": "I-19",
    "I-08": "I-09",
    "I-09": "I-07",
    "I-10": "I-11",
    "I-11": "I-06",
    
    # I-12 a I-17 foram atualizados em Março (Nova era), mas se for antigo, eis as rotas:
    "I-14": "I-15", # O I-14 antigo era de Fevereiro (Cajamar). Vai para I-15.
    
    "I-18": "I-17",
    "I-19": "I-20",
    "I-20": "I-21",
    "I-21": "I-22",
    "I-22": "I-23",
    "I-23": "I-21", # Transição -> Ganha Ganha
    "I-24": "I-24",
    "I-25": "I-25",
    "I-26": "I-26",
    "I-27": "I-27",
    "I-28": "I-28",
    "I-29": "I-29",
    "I-32": "I-38", # Fretado
    "I-34": "I-40", # Carreira
    "I-35": "I-41", # Salarial
    "I-36": "I-42"  # Terceirizados
}

for oldId, data in rawState.items():
    if oldId == '_columnOrder': continue
    
    updatedAt = data.get('updatedAt', '')
    
    if updatedAt.startswith('2026-03'):
        # Foi editado recentemente. O usuário JÁ USOU O NOVO ID. NÃO MEXA!
        newId = oldId
        print(f"[{oldId}] 🔒 MANTIDO VINCULO (Data: Março): '{data.get('updates', '')[:30]}'")
    else:
        # Foi editado em FEVEREIRO. O ID é VELHO. Mova usando o mapa de época.
        newId = old_to_new.get(oldId)
        if newId:
            print(f"[{oldId}] ➡️ MOVIDO PARA [{newId}] (Data: Fev): '{data.get('updates', '')[:30]}'")
        else:
            newId = oldId # Fallback
            
    newState[newId] = data

for col, items in rawState['_columnOrder'].items():
    new_col = []
    for id in items:
        # Verifica a data do card para saber de qual lista ele deve converter
        card_data = rawState.get(id, {})
        if card_data.get('updatedAt', '').startswith('2026-03'):
            new_col.append(id)
        else:
            mapped_id = old_to_new.get(id, id)
            if mapped_id not in new_col:
                new_col.append(mapped_id)
    newState['_columnOrder'][col] = new_col

json.dump(newState, open('/tmp/kanban_state_surgical.json', 'w'), indent=2)
print("Prévia cirúrgica gerada em /tmp/kanban_state_surgical.json")
