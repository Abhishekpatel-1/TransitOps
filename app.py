from __future__ import annotations

from pathlib import Path

import pandas as pd
import streamlit as st

from src.recommender import MovieRecommender


DATA_PATH = Path(__file__).parent / "data" / "movies.csv"


@st.cache_resource
def get_recommender() -> MovieRecommender:
    return MovieRecommender.from_csv(DATA_PATH)


def render_movie_card(movie: pd.Series) -> None:
    score = movie.get("similarity_score", 0)
    year = int(movie["year"]) if pd.notna(movie.get("year")) else "N/A"
    rating = movie.get("rating", "N/A")

    with st.container(border=True):
        st.subheader(movie["title"])
        st.caption(f"{year} | {movie['genres']} | Similarity: {score:.3f}")
        st.write(movie["overview"])
        st.markdown(
            f"**Director:** {movie['director']}  \n"
            f"**Cast:** {movie['cast']}  \n"
            f"**Rating:** {rating}"
        )


def main() -> None:
    st.set_page_config(
        page_title="Movie Recommendation System",
        page_icon="🎬",
        layout="wide",
    )

    st.title("Movie Recommendation System")
    st.caption("Content-based recommendations using TF-IDF and cosine similarity.")

    recommender = get_recommender()

    with st.sidebar:
        st.header("Recommendation Controls")
        selected_movie = st.selectbox(
            "Choose a movie",
            recommender.titles,
            index=recommender.titles.index("Inception")
            if "Inception" in recommender.titles
            else 0,
        )
        top_n = st.slider("Number of recommendations", min_value=3, max_value=10, value=5)

    recommendations = recommender.recommend(selected_movie, top_n=top_n)
    selected_details = recommender.movies[
        recommender.movies["title"].str.lower() == selected_movie.lower()
    ].iloc[0]

    left_column, right_column = st.columns([0.95, 1.35], gap="large")

    with left_column:
        st.header("Selected Movie")
        render_movie_card(selected_details)

    with right_column:
        st.header("Recommended Movies")
        for _, movie in recommendations.iterrows():
            render_movie_card(movie)

    with st.expander("Browse movie catalog"):
        st.dataframe(
            recommender.movies[
                ["title", "year", "genres", "director", "rating"]
            ].sort_values("title"),
            use_container_width=True,
            hide_index=True,
        )


if __name__ == "__main__":
    main()

