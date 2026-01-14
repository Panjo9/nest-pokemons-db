import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PokemonService {
  private readonly defaultLimit?: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      const createdPokemon = new this.pokemonModel(createPokemonDto);
      await createdPokemon.save();
      return createdPokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<Pokemon[]> {
    const { limit = this.defaultLimit, offset } = paginationDto;
    const pokemons = this.pokemonModel.find();
    if (offset) pokemons.skip(offset);
    if (limit) pokemons.limit(limit);
    pokemons.select('-__v');

    return pokemons;
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null;
    let type: string;

    if (!Number.isNaN(+term)) {
      type = 'no';
      pokemon = await this.pokemonModel.findOne({ no: +term });
    } else if (isValidObjectId(term)) {
      type = 'id';
      pokemon = await this.pokemonModel.findById(term);
    } else {
      type = 'name';
      pokemon = await this.pokemonModel.findOne({ name: term.trim() });
    }

    if (!pokemon)
      throw new NotFoundException(`Pokemon with ${type} ${term} not found`);

    return pokemon;
  }

  async update(no: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      if (!Number.isNaN(+no)) {
        const pokemon = await this.pokemonModel.findOneAndUpdate(
          { no: +no },
          updatePokemonDto,
          { new: true },
        );
        if (!pokemon)
          throw new NotFoundException(`Pokemon with no ${no} not found`);
        return pokemon;
      }
      throw new BadRequestException(`Pokemon with no ${no} not found`);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(no: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: no });
    if (deletedCount === 0)
      throw new NotFoundException(`Pokemon with no ${no} not found`);
    return 'deleted';
  }

  async fillPokemonsWithSeedData(pokemons: Pokemon[]) {
    const pokemonsDB = await this.pokemonModel.insertMany(pokemons, {
      rawResult: true,
    });
    return pokemonsDB;
  }

  handleExceptions(error: any) {
    if (error.code === 11000)
      throw new BadRequestException(
        `Pokemon already exists ${JSON.stringify(error.keyValue)}`,
      );
    throw new InternalServerErrorException(
      `Can't update pokemon - Check server logs`,
    );
  }
}
