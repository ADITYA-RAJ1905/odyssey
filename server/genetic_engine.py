import numpy as np
from typing import Dict, Any, List, Tuple

GENE_BOUNDS = {
    "speed": (10.0, 45.0),
    "fuel_capacity": (50.0, 300.0),
    "cargo_bays": (10.0, 100.0),
    "durability": (50.0, 300.0),
    "sail_surface": (20.0, 150.0),
    "energy_efficiency": (0.6, 2.4)
}

VORTEX_CHALLENGE = {
    "distance": 320.0,
    "current_force": 14.0,
    "wave_stress_threshold": 160.0,
    "fuel_cost_per_mile": 0.0045,
    "required_cargo": 35.0
}

class ShipChromosome:
    def __init__(self, genes: Dict[str, float] = None):
        if genes is None:
            self.genes = {
                k: float(np.random.uniform(bounds[0], bounds[1]))
                for k, bounds in GENE_BOUNDS.items()
            }
        else:
            self.genes = {
                k: float(np.clip(genes[k], GENE_BOUNDS[k][0], GENE_BOUNDS[k][1]))
                for k in GENE_BOUNDS
            }
        self.fitness = 0.0
        self.metrics = {}
        self.evaluate()

    def evaluate(self) -> float:
        speed = self.genes["speed"]
        fuel_cap = self.genes["fuel_capacity"]
        cargo = self.genes["cargo_bays"]
        durability = self.genes["durability"]
        sail = self.genes["sail_surface"]
        eff = self.genes["energy_efficiency"]

        # Physics simulation through the Calamity Vortex
        weight = durability * 0.75 + cargo * 1.6 + fuel_cap * 0.45 + sail * 0.25
        effective_speed = max(4.0, speed + (sail * 0.12) - (weight * 0.015) - VORTEX_CHALLENGE["current_force"])

        # Fuel consumption
        fuel_burned = (effective_speed ** 1.35 * weight * VORTEX_CHALLENGE["fuel_cost_per_mile"]) / eff
        total_fuel_needed = (VORTEX_CHALLENGE["distance"] / effective_speed) * fuel_burned

        # Travel time in hours
        travel_time = VORTEX_CHALLENGE["distance"] / effective_speed

        # Structural stress
        stress_absorbed = durability - VORTEX_CHALLENGE["wave_stress_threshold"]

        # Multi-objective fitness formulation
        score = 0.0

        # Survival check 1: Fuel sufficiency
        if fuel_cap < total_fuel_needed:
            score -= (total_fuel_needed - fuel_cap) * 1.8
        else:
            surplus_fuel = fuel_cap - total_fuel_needed
            score += 25.0 + min(40.0, surplus_fuel * 0.15)

        # Survival check 2: Hull integrity
        if stress_absorbed < 0:
            score -= abs(stress_absorbed) * 2.5
        else:
            score += 30.0 + min(35.0, stress_absorbed * 0.2)

        # Objective 3: Speed bonus (minimize travel time)
        score += max(0.0, 50.0 - travel_time * 1.5)

        # Objective 4: Cargo capacity payload bonus
        score += cargo * 0.65

        # Normalization
        self.fitness = max(1.0, score + 100.0)
        self.metrics = {
            "weight": round(weight, 1),
            "effective_speed": round(effective_speed, 1),
            "fuel_consumed": round(total_fuel_needed, 1),
            "travel_time_hours": round(travel_time, 1),
            "hull_margin": round(stress_absorbed, 1),
            "cargo_payload": round(cargo, 1),
            "survived_vortex": bool(fuel_cap >= total_fuel_needed and stress_absorbed >= 0)
        }
        return self.fitness

class ShipGeneticAlgorithm:
    def __init__(self, population_size: int = 40):
        self.pop_size = population_size
        self.population: List[ShipChromosome] = []

    def run_evolution(self,
                      generations: int = 30,
                      mutation_rate: float = 0.15,
                      crossover_rate: float = 0.85) -> Dict[str, Any]:
        np.random.seed(42)
        self.population = [ShipChromosome() for _ in range(self.pop_size)]

        history = []

        for gen in range(1, generations + 1):
            for ind in self.population:
                ind.evaluate()

            # Sort by fitness descending
            self.population.sort(key=lambda x: x.fitness, reverse=True)

            best_fitness = self.population[0].fitness
            avg_fitness = float(np.mean([x.fitness for x in self.population]))
            worst_fitness = self.population[-1].fitness

            history.append({
                "generation": gen,
                "best_fitness": round(best_fitness, 2),
                "avg_fitness": round(avg_fitness, 2),
                "worst_fitness": round(worst_fitness, 2),
                "best_chromosome": {k: round(v, 1) for k, v in self.population[0].genes.items()}
            })

            # Next generation creation
            new_pop = []
            # Elitism: retain top 2
            new_pop.append(ShipChromosome(self.population[0].genes))
            new_pop.append(ShipChromosome(self.population[1].genes))

            while len(new_pop) < self.pop_size:
                # Tournament Selection
                p1 = self._tournament_select(k=3)
                p2 = self._tournament_select(k=3)

                # Crossover
                if np.random.rand() < crossover_rate:
                    child_genes = self._crossover(p1.genes, p2.genes)
                else:
                    child_genes = dict(p1.genes)

                # Mutation
                child_genes = self._mutate(child_genes, mutation_rate)
                new_pop.append(ShipChromosome(child_genes))

            self.population = new_pop

        # Final evaluation
        for ind in self.population:
            ind.evaluate()
        self.population.sort(key=lambda x: x.fitness, reverse=True)
        champion = self.population[0]

        # Population scatter for UI visualization
        pop_scatter = []
        for ind in self.population:
            pop_scatter.append({
                "speed": round(ind.genes["speed"], 1),
                "durability": round(ind.genes["durability"], 1),
                "cargo": round(ind.genes["cargo_bays"], 1),
                "fuel": round(ind.genes["fuel_capacity"], 1),
                "fitness": round(ind.fitness, 1),
                "survived": ind.metrics["survived_vortex"]
            })

        return {
            "generations_completed": generations,
            "history": history,
            "best_ship": {
                "genes": {k: round(v, 1) for k, v in champion.genes.items()},
                "fitness": round(champion.fitness, 2),
                "metrics": champion.metrics
            },
            "population_scatter": pop_scatter,
            "environmental_challenge": VORTEX_CHALLENGE
        }

    def _tournament_select(self, k: int = 3) -> ShipChromosome:
        candidates = np.random.choice(self.population, size=k, replace=False)
        candidates = sorted(candidates, key=lambda x: x.fitness, reverse=True)
        return candidates[0]

    def _crossover(self, g1: Dict[str, float], g2: Dict[str, float]) -> Dict[str, float]:
        # Blend / uniform crossover
        child = {}
        for k in GENE_BOUNDS:
            alpha = np.random.uniform(-0.1, 1.1)
            child[k] = alpha * g1[k] + (1.0 - alpha) * g2[k]
        return child

    def _mutate(self, genes: Dict[str, float], mutation_rate: float) -> Dict[str, float]:
        mutated = dict(genes)
        for k, bounds in GENE_BOUNDS.items():
            if np.random.rand() < mutation_rate:
                range_span = bounds[1] - bounds[0]
                noise = np.random.normal(0, 0.15 * range_span)
                mutated[k] = float(np.clip(mutated[k] + noise, bounds[0], bounds[1]))
        return mutated

    def evaluate_manual_configuration(self, genes: Dict[str, float]) -> Dict[str, Any]:
        chrom = ShipChromosome(genes)
        return {
            "genes": {k: round(v, 1) for k, v in chrom.genes.items()},
            "fitness": round(chrom.fitness, 2),
            "metrics": chrom.metrics
        }

    def simulate_fleet_derby(self, generation_mode: str = "gen_1") -> Dict[str, Any]:
        # Generates a visual 8-ship race based on genetic algorithm state
        if not self.population or len(self.population) < 8:
            self.population = [ShipChromosome() for _ in range(36)]
            for ind in self.population: ind.evaluate()

        # If gen_evolved requested, run 15 generations of selection
        if generation_mode == "evolved":
            for _ in range(15):
                new_p = [self.population[0], self.population[1]]
                while len(new_p) < self.pop_size:
                    p1 = self._tournament_select(k=3)
                    p2 = self._tournament_select(k=3)
                    cg = self._mutate(self._crossover(p1.genes, p2.genes), 0.15)
                    new_p.append(ShipChromosome(cg))
                self.population = new_p
                for ind in self.population: ind.evaluate()
            self.population.sort(key=lambda x: x.fitness, reverse=True)

        ship_names = [
            "Apex Manta", "Gale Skiff", "Titan Catamaran", "Solar Ray",
            "Abyssal Glider", "Storm Chaser", "Iron Hull IV", "Vortex Drifter"
        ]
        colors = [
            "#00f2fe", "#f59e0b", "#10b981", "#a855f7",
            "#3b82f6", "#ef4444", "#e2e8f0", "#fbbf24"
        ]

        derby_ships = []
        selected_inds = self.population[:8]

        for i, ind in enumerate(selected_inds):
            speed = ind.metrics["effective_speed"]
            durability = ind.genes["durability"]
            fuel_cap = ind.genes["fuel_capacity"]
            survived = ind.metrics["survived_vortex"]

            # Simulate 35 time frames of movement across 100m track
            positions = [0.0]
            curr_pos = 0.0
            capsized_at = None
            out_of_fuel_at = None

            for t in range(1, 35):
                if curr_pos >= 100.0:
                    positions.append(100.0)
                    continue

                # Hazard checks during race: whirlpool at tick 12, gale at tick 24
                if t == 12 and durability < 140 and capsized_at is None:
                    capsized_at = t
                if t == 22 and fuel_cap < 110 and out_of_fuel_at is None:
                    out_of_fuel_at = t

                if capsized_at is not None:
                    curr_pos = max(0.0, curr_pos - 0.2) # drifting backward
                elif out_of_fuel_at is not None:
                    curr_pos += speed * 0.05 # dead drift
                else:
                    jitter = np.random.uniform(0.85, 1.15)
                    curr_pos += (speed * 0.14) * jitter

                positions.append(round(float(min(100.0, curr_pos)), 1))

            finish_tick = next((idx for idx, pos in enumerate(positions) if pos >= 100.0), None)

            derby_ships.append({
                "id": f"ship_{i}",
                "name": ship_names[i],
                "color": colors[i],
                "genes": ind.genes,
                "fitness": round(ind.fitness, 1),
                "speed": round(speed, 1),
                "durability": round(durability, 1),
                "positions": positions,
                "survived": survived,
                "capsized": bool(capsized_at is not None),
                "out_of_fuel": bool(out_of_fuel_at is not None),
                "finish_tick": finish_tick,
                "final_position": positions[-1]
            })

        # Rank by finish tick or final position
        derby_ships.sort(key=lambda s: (s["finish_tick"] if s["finish_tick"] is not None else 999, -s["final_position"]))
        for rank, s in enumerate(derby_ships):
            s["rank"] = rank + 1

        return {
            "generation_mode": generation_mode,
            "total_ticks": 35,
            "derby_ships": derby_ships,
            "ships": derby_ships,
            "winner": derby_ships[0]
        }

genetic_engine = ShipGeneticAlgorithm(population_size=36)


