# Votereum - DApp de Vote 🗳️

Votereum est une **application décentralisée (DApp)** permettant à une organisation de gérer un processus de vote **transparent et sécurisé** sur la blockchain **Ethereum**.

---

## 📽️ Démo

🎥 **Vidéo démonstration des fonctionnalités** :

🌍 **Déploiement public de la DApp** : https://vercel.com/delassusfelixs-projects/smart-contract

---

## 📌 Fonctionnalités principales

✅ **Gestion des électeurs** : Ajout d'une liste blanche d'électeurs autorisés.  
✅ **Propositions** : Les électeurs peuvent soumettre des propositions pendant une session définie.  
✅ **Vote** : Chaque électeur peut voter pour une proposition.  
✅ **Comptabilisation des votes** : L'administrateur clôture le vote et publie les résultats.  
✅ **Transparence** : Tout le monde peut consulter le vainqueur et les votes.  

---

## 🛠️ Architecture du projet

### 🔹 **1. Smart Contract - Solidity**

Le contrat intelligent **Voting** est écrit en Solidity et utilise la bibliothèque **OpenZeppelin - Ownable** pour la gestion des droits administratifs.

📌 **Principaux éléments du contrat :**

- **Structures de données** :
  ```solidity
  struct Voter {
      bool isRegistered;
      bool hasVoted;
      uint votedProposalId;
  }

  struct Proposal {
      string description;
      uint voteCount;
  }
  ```
- **Enumération des phases du vote** :
  ```solidity
  enum WorkflowStatus {
      RegisteringVoters,
      ProposalsRegistrationStarted,
      ProposalsRegistrationEnded,
      VotingSessionStarted,
      VotingSessionEnded,
      VotesTallied
  }
  ```
- **Événements émis** :
  ```solidity
  event VoterRegistered(address voterAddress);
  event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
  event ProposalRegistered(uint proposalId);
  event Voted(address voter, uint proposalId);
  ```

### 🔹 **2. Frontend - React / Next.js**

Le front-end est développé avec **Next.js**, permettant une interaction fluide avec le smart contract.

📌 **Principales fonctionnalités du front :**

- 🎛️ Interface d'administration pour gérer les sessions (propositions et votes).
- 🗳️ Interface électeur pour proposer et voter.
- 📊 Affichage dynamique des résultats en temps réel.

### 🔹 **3. Tests**

Nous avons implémenté des tests unitaires et d’intégration pour garantir la fiabilité du contrat.

---

## 🚀 Installation et Utilisation

### 1️⃣ **Cloner le dépôt**
```bash
git clone https://github.com/DelassusFelix/Smart_contract.git
cd Smart_contract
```

### 2️⃣ **Installer les dépendances**
```bash
npm install
```

### 3️⃣ **Déploiement du Smart Contract**
```bash
npx hardhat compile
npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/deployVoting.ts --network localhost
```

### 4️⃣ **Lancer le Frontend**
```bash
npm run dev
```

---

## 👥 Équipe & Organisation

🛠 **Membres du projet** :

- 🔹 **Membre 1** Félix : [(@github)](https://github.com/DelassusFelix)
- 🔹 **Membre 2** Victor : [(@github)](https://github.com/TyZoxx)

📌 **Répartition des tâches :**

- 💻 **Smart Contract & Tests** : Victor
- 🎨 **Frontend & Intégration** : Félix
- ☁️ **Déploiement & Documentation** : Victor & Félix

---
