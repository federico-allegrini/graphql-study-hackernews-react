import { useMutation, gql } from "@apollo/client";
import { AUTH_TOKEN, LINKS_PER_PAGE } from "../constants";
import { timeDifferenceForDate } from "../utils";
import { FEED_QUERY } from "./LinkList";

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        id
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

const take = LINKS_PER_PAGE;
const skip = 0;
const orderBy = { createdAt: "desc" };

const Link = (props) => {
  const { link } = props;
  const authToken = localStorage.getItem(AUTH_TOKEN);

  const [vote, { loading: voteLoading, error: voteError }] = useMutation(
    VOTE_MUTATION,
    {
      variables: {
        linkId: link.id,
      },
      update(cache, { data: { vote } }) {
        // Problems with cache update
        const { feed } = cache.readQuery({
          query: FEED_QUERY,
          variables: {
            take,
            skip,
            orderBy,
          },
        });

        const updatedLinks = feed.links.map((feedLink) => {
          if (feedLink.id === link.id) {
            return {
              ...feedLink,
              votes: [...feedLink.votes, vote],
            };
          }
          return feedLink;
        });

        cache.writeQuery({
          query: FEED_QUERY,
          data: {
            feed: {
              links: updatedLinks,
            },
          },
          variables: {
            take,
            skip,
            orderBy,
          },
        });
      },
    }
  );

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}.</span>
        {authToken && (
          <div
            className="ml1 gray f11"
            style={{ cursor: "pointer" }}
            onClick={() => {
              vote()
                .then((data) => console.log(data))
                .catch((err) => console.log(err));
            }}
          >
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {link.description} ({link.url}) <br />
          {voteLoading && <p>Loading...</p>}
          {voteError && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              Error: {voteError.message}
            </p>
          )}
        </div>
        {authToken && (
          <div className="f6 lh-copy gray">
            {link.votes.length} votes | by{" "}
            {link.postedBy ? link.postedBy.name : "Unknown"}{" "}
            {timeDifferenceForDate(link.createdAt)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Link;
