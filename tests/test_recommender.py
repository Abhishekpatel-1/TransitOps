import pandas as pd
import pytest

from src.recommender import MovieRecommender


def sample_movies() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "title": "Space Dream",
                "genres": "Sci-Fi Adventure",
                "keywords": "space dream mission",
                "overview": "Explorers travel through dreams and space.",
                "cast": "A B",
                "director": "Director One",
            },
            {
                "title": "Dream Heist",
                "genres": "Sci-Fi Thriller",
                "keywords": "dream heist subconscious",
                "overview": "A team steals secrets inside dreams.",
                "cast": "C D",
                "director": "Director One",
            },
            {
                "title": "Cooking Story",
                "genres": "Drama Family",
                "keywords": "kitchen family restaurant",
                "overview": "A family rebuilds a restaurant together.",
                "cast": "E F",
                "director": "Director Two",
            },
        ]
    )


def test_recommend_returns_similar_movies_first() -> None:
    recommender = MovieRecommender(sample_movies())

    results = recommender.recommend("Space Dream", top_n=2)

    assert results.iloc[0]["title"] == "Dream Heist"
    assert "similarity_score" in results.columns
    assert len(results) == 2


def test_recommend_rejects_unknown_title() -> None:
    recommender = MovieRecommender(sample_movies())

    with pytest.raises(ValueError, match="was not found"):
        recommender.recommend("Missing Movie")


def test_search_titles_filters_catalog() -> None:
    recommender = MovieRecommender(sample_movies())

    assert recommender.search_titles("dream") == ["Dream Heist", "Space Dream"]

