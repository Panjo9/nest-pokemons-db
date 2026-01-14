import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PokeResponse } from './interfaces/pokemon.interfaces';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async execute() {
    const { data } = await this.http.get<PokeResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=650`,
    );
    const pokemons: { name: string; url: string; no: number }[] = [];
    const resultsLength = data.results.length;
    for (let i = 0; i < resultsLength; i++) {
      const pokemon = data.results[i];
      const segments: string[] = pokemon.url.split('/');
      const no: number = +segments[segments.length - 2];
      pokemons.push({ ...pokemon, no });
    }
    await this.pokemonModel.insertMany(pokemons);
    return 'Seed populated';
    // const seedPokemon = new this.seedModel(results);
    // await seedPokemon.save();
  }
}
