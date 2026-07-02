from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


DEFAULT_FEATURE_COLUMNS = (
    "genres",
    "keywords",
    "overview",
    "cast",
    "director",
)


@dataclass(frozen=True)
class RecommendationConfig:
    title_column: str = "title"
    feature_columns: tuple[str, ...] = DEFAULT_FEATURE_COLUMNS


class MovieRecommender:
    """Content-based movie recommender using TF-IDF and cosine similarity."""

    def __init__(
        self,
        movies: pd.DataFrame,
        config: RecommendationConfig | None = None,
    ) -> None:
        self.config = config or RecommendationConfig()
        self.movies = self._prepare_movies(movies)
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.tfidf_matrix = self.vectorizer.fit_transform(self.movies["combined_features"])
        self.similarity_matrix = cosine_similarity(self.tfidf_matrix)
        self._title_lookup = {
            self._normalize_title(title): index
            for index, title in self.movies[self.config.title_column].items()
        }

    @classmethod
    def from_csv(
        cls,
        csv_path: str | Path,
        config: RecommendationConfig | None = None,
    ) -> "MovieRecommender":
        return cls(pd.read_csv(csv_path), config=config)

    @property
    def titles(self) -> list[str]:
        return sorted(self.movies[self.config.title_column].dropna().unique().tolist())

    def recommend(self, title: str, top_n: int = 5) -> pd.DataFrame:
        if top_n < 1:
            raise ValueError("top_n must be at least 1")

        movie_index = self._find_movie_index(title)
        similarity_scores = list(enumerate(self.similarity_matrix[movie_index]))
        ranked_movies = sorted(similarity_scores, key=lambda item: item[1], reverse=True)

        recommendation_indexes = [
            index for index, _score in ranked_movies if index != movie_index
        ][:top_n]
        recommendations = self.movies.iloc[recommendation_indexes].copy()
        recommendations["similarity_score"] = [
            round(float(self.similarity_matrix[movie_index][index]), 3)
            for index in recommendation_indexes
        ]
        return recommendations.reset_index(drop=True)

    def search_titles(self, query: str, limit: int = 10) -> list[str]:
        normalized_query = query.strip().lower()
        if not normalized_query:
            return self.titles[:limit]

        matches = [
            title
            for title in self.titles
            if normalized_query in title.lower()
        ]
        return matches[:limit]

    def _prepare_movies(self, movies: pd.DataFrame) -> pd.DataFrame:
        movies = movies.copy()
        title_column = self.config.title_column

        if title_column not in movies.columns:
            raise ValueError(f"Dataset must include a '{title_column}' column")

        missing_columns = [
            column for column in self.config.feature_columns if column not in movies.columns
        ]
        if missing_columns:
            raise ValueError(
                "Dataset is missing required feature columns: "
                + ", ".join(missing_columns)
            )

        movies = movies.dropna(subset=[title_column]).drop_duplicates(subset=[title_column])
        for column in self.config.feature_columns:
            movies[column] = movies[column].fillna("").astype(str)

        movies["combined_features"] = movies.apply(self._combine_features, axis=1)
        return movies.reset_index(drop=True)

    def _combine_features(self, row: pd.Series) -> str:
        return " ".join(row[column] for column in self.config.feature_columns)

    def _find_movie_index(self, title: str) -> int:
        normalized_title = self._normalize_title(title)
        try:
            return self._title_lookup[normalized_title]
        except KeyError as exc:
            raise ValueError(f"Movie '{title}' was not found in the catalog") from exc

    @staticmethod
    def _normalize_title(title: str) -> str:
        return " ".join(str(title).lower().split())


def load_movies(csv_path: str | Path) -> pd.DataFrame:
    return pd.read_csv(csv_path)


def required_columns() -> Iterable[str]:
    return ("title", *DEFAULT_FEATURE_COLUMNS)

