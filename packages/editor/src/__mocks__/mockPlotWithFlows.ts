import type { Plot } from "@dialog-flow-designer/shared-types/df-parser-server";

const plot: Plot = {
  flows: {
    "id#fl_1772314a": {
      name: "concrete_book_flow",
      nodes: [
        "id#nd_322a8f8f",
        "id#nd_39a26437",
        "id#nd_f52b12ac",
        "id#nd_a6f80f2b",
        "id#nd_2658e2ec",
        "id#nd_2126aa4a",
        "id#nd_daa6d96f",
        "id#nd_c77759d2",
        "id#nd_5bbd1d11",
        "id#nd_a7399602",
        "id#nd_379cc2b8",
        "id#nd_6030c06a",
        "id#nd_9f68c5ea",
        "id#nd_4dbe14fc",
      ],
    },
    "id#fl_3531611f": {
      name: "bot_fav_book",
      nodes: ["id#nd_7b4e9517", "id#nd_266d1745", "id#nd_e27824ff"],
    },
    "id#fl_4386d252": {
      name: "books_general",
      nodes: [
        "id#nd_abd5779b",
        "id#nd_4ffdd28c",
        "id#nd_7b39976f",
        "id#nd_f29b0b57",
        "id#nd_00c836ac",
      ],
    },
    "id#fl_5de7c201": {
      name: "genre_flow",
      nodes: [
        "id#nd_5a6cbfe3",
        "id#nd_2b8abc07",
        "id#nd_2d3427a5",
        "id#nd_ac96df56",
        "id#nd_0f8b2ea5",
      ],
    },
    "id#fl_5f304492": {
      name: "undetected_flow",
      nodes: [
        "id#nd_83295d8d",
        "id#nd_654a2c67",
        "id#nd_d7aace1e",
        "id#nd_494d703b",
        "id#nd_ab019aae",
        "id#nd_aea9a2cb",
      ],
    },
    "id#fl_6cb484f8": {
      name: "global_flow",
      nodes: ["id#nd_961044f9", "id#nd_6ee48e8f"],
    },
    "id#fl_7b12037e": {
      name: "bible_flow",
      nodes: ["id#nd_9ab82bd1", "id#nd_b8cafe88"],
    },
  },
  imports: {
    "id#im_2315148e": {
      code: "from common.constants import CAN_NOT_CONTINUE",
      name: "CAN_NOT_CONTINUE",
    },
    "id#im_286f940a": {
      code: "import df_engine.labels as lbl",
      name: "lbl",
    },
    "id#im_2a271e69": {
      code: "from df_engine.core.keywords import GLOBAL",
      name: "GLOBAL",
    },
    "id#im_32b0f59a": {
      code: "from df_engine.core.keywords import PROCESSING",
      name: "PROCESSING",
    },
    "id#im_3ab47bae": {
      code: "from df_engine.core.keywords import RESPONSE",
      name: "RESPONSE",
    },
    "id#im_3e067dcc": {
      code: "import scenario.processing as loc_prs",
      name: "loc_prs",
    },
    "id#im_41af699e": {
      code: "import sentry_sdk",
      name: "sentry_sdk",
    },
    "id#im_4f70c386": {
      code: "from df_engine.core.keywords import TRANSITIONS",
      name: "TRANSITIONS",
    },
    "id#im_5570ef5d": {
      code: "import df_engine.conditions as cnd",
      name: "cnd",
    },
    "id#im_7519bd78": {
      code: "from common.science import OFFER_TALK_ABOUT_SCIENCE",
      name: "OFFER_TALK_ABOUT_SCIENCE",
    },
    "id#im_75fca0c3": {
      code: "import logging",
      name: "logging",
    },
    "id#im_7fe21896": {
      code: "from df_engine.core import Actor",
      name: "Actor",
    },
    "id#im_901c28d9": {
      code: "import scenario.response as loc_rsp",
      name: "loc_rsp",
    },
    "id#im_a5d6e252": {
      code: "from common.movies import SWITCH_MOVIE_SKILL_PHRASE",
      name: "SWITCH_MOVIE_SKILL_PHRASE",
    },
    "id#im_c730d5f4": {
      code: "import scenario.condition as loc_cnd",
      name: "loc_cnd",
    },
    "id#im_dc700280": {
      code: "from os import getenv",
      name: "getenv",
    },
    "id#im_ddf7369c": {
      code: "from common.constants import CAN_CONTINUE_SCENARIO",
      name: "CAN_CONTINUE_SCENARIO",
    },
    "id#im_de382ef5": {
      code: "from common.constants import MUST_CONTINUE",
      name: "MUST_CONTINUE",
    },
    "id#im_e390bce5": {
      code: "import common.dff.integration.processing as int_prs",
      name: "int_prs",
    },
    "id#im_e5e8f8a6": {
      code: "import common.dff.integration.condition as int_cnd",
      name: "int_cnd",
    },
    "id#im_ec8b3ea6": {
      code: "import random",
      name: "random",
    },
  },
  linking: {
    "id#ln_0269d896": {
      args: [["id#ln_5d1bda05", "id#df_3bfa4ca0"]],
      object: "id#df_de705fa4",
    },
    "id#ln_02e0fa83": {
      object: "id#df_2e747aec",
    },
    "id#ln_049b7533": {
      object: "id#df_2e747aec",
    },
    "id#ln_04dff676": {
      object: "id#df_6d465c6c",
    },
    "id#ln_05244583": {
      args: [["id#ln_761060ae", "id#df_6dde74f0"]],
      object: "id#df_a3de4295",
      parent: "id#ln_e8ee330e",
    },
    "id#ln_0533745a": {
      object: "id#df_2fda9a7f",
    },
    "id#ln_093949bb": {
      object: "id#df_2e747aec",
    },
    "id#ln_0abf51a6": {
      args: ["user_fav_book_visited", "id#df_595fb614"],
      object: "id#df_911e77d5",
    },
    "id#ln_0b7baa69": {
      args: ["id#df_39f25960"],
      object: "id#df_08773025",
      parent: "id#ln_e9443c67",
    },
    "id#ln_0deca063": {
      object: "id#df_ee071fff",
    },
    "id#ln_0e569491": {
      object: "id#df_8dde18b5",
    },
    "id#ln_124de46b": {
      object: "id#df_1b54e101",
    },
    "id#ln_12988f34": {
      args: [["id#df_67be0739", "id#df_4c6fa153"]],
      object: "id#df_793930dc",
      parent: "id#ln_247a9d29",
    },
    "id#ln_19b02f59": {
      kwargs: {
        initial: ["Never heard about it. I will check it out later. "],
      },
      object: "id#df_daefec02",
    },
    "id#ln_1bac4a59": {
      args: ["id#df_33f2c6d7"],
      object: "id#df_ebed75bb",
    },
    "id#ln_1e11d65f": {
      object: "id#df_579f085d",
    },
    "id#ln_1f72b477": {
      args: [["id#df_2fda9a7f", "id#df_674339c2"]],
      object: "id#df_a3de4295",
      parent: "id#ln_41491750",
    },
    "id#ln_214a2d84": {
      args: ["book_start_visited"],
      object: "id#df_3ffc1e9f",
      parent: "id#ln_ff52dfb4",
    },
    "id#ln_2255fac5": {
      args: ["id#df_4d6a9580"],
      object: "id#df_793930dc",
      parent: "id#ln_b85d4e73",
    },
    "id#ln_23257c1a": {
      args: [["id#df_f51c518e", "id#ln_91d2e7fb"]],
      object: "id#df_de705fa4",
    },
    "id#ln_247a9d29": {
      args: [["id#ln_12988f34", "id#df_46dfc204"]],
      object: "id#df_a3de4295",
      parent: "id#ln_4f9b8d3b",
    },
    "id#ln_25fe3532": {
      object: "id#df_8dde18b5",
    },
    "id#ln_27e19b5c": {
      object: "id#df_c841e57b",
    },
    "id#ln_2801c2a4": {
      object: "id#df_1b54e101",
    },
    "id#ln_29038625": {
      object: "id#df_eb39287e",
    },
    "id#ln_2927e6ac": {
      args: [
        {
          kwarg_name: "initial",
          output: "",
        },
      ],
      object: "id#df_daefec02",
    },
    "id#ln_292a9324": {
      object: "id#df_2fda9a7f",
    },
    "id#ln_2996cfdd": {
      object: "id#df_7ac753d4",
    },
    "id#ln_2a65922e": {
      object: "id#df_fda5ab12",
    },
    "id#ln_2b0e6b93": {
      object: "id#df_2fda9a7f",
    },
    "id#ln_2b729925": {
      object: "id#df_eb39287e",
    },
    "id#ln_2c410f56": {
      args: [["id#df_f51c518e", "id#ln_bc4e30fb"]],
      object: "id#df_de705fa4",
    },
    "id#ln_2d18c1ce": {
      args: [["id#df_0d5ebfa6", "id#df_360f1ec0"]],
      object: "id#df_a3de4295",
      parent: "id#ln_4ac9eb44",
    },
    "id#ln_3013bcab": {
      object: "id#df_c841e57b",
    },
    "id#ln_30645bd8": {
      object: "id#df_2e747aec",
    },
    "id#ln_323d576d": {
      object: "id#df_2e747aec",
    },
    "id#ln_32d32a8b": {
      args: ["book_skill_active"],
      object: "id#df_3ffc1e9f",
      parent: "id#ln_ee59480b",
    },
    "id#ln_33f97879": {
      args: ["book_skill_active", "id#df_595fb614"],
      object: "id#df_911e77d5",
    },
    "id#ln_348ee896": {
      args: ["id#df_407f54ee"],
      object: "id#df_d195bc92",
    },
    "id#ln_348fc1c6": {
      args: ["denied_favorite", "id#df_595fb614"],
      object: "id#df_911e77d5",
    },
    "id#ln_3764f81f": {
      args: [["id#df_0b217e34", "id#df_dd8c9daa"]],
      object: "id#df_de705fa4",
    },
    "id#ln_39ba1b25": {
      kwargs: {
        initial: ["It's OK. Maybe some other books will fit you better. "],
      },
      object: "id#df_daefec02",
    },
    "id#ln_3b06f6a5": {
      args: ["id#df_1441b53b"],
      object: "id#df_d195bc92",
    },
    "id#ln_3c02cde6": {
      kwargs: {
        initial: ["As you wish. "],
      },
      object: "id#df_daefec02",
    },
    "id#ln_3e794c60": {
      object: "id#df_2fda9a7f",
    },
    "id#ln_4128875e": {
      object: "id#df_2e747aec",
    },
    "id#ln_41491750": {
      args: [
        ["id#ln_57495fd6", "id#ln_1f72b477", "id#ln_e20e30d3", "id#ln_77ed8239", "id#ln_8f1928aa"],
      ],
      object: "id#df_de705fa4",
    },
    "id#ln_419b2ae0": {
      args: ["id#df_4d6a9580"],
      object: "id#df_793930dc",
      parent: "id#ln_912e4e81",
    },
    "id#ln_4270b69a": {
      args: ["id#df_9f643020"],
      object: "id#df_ebed75bb",
    },
    "id#ln_487a17a9": {
      args: ["id#df_4d6a9580"],
      object: "id#df_793930dc",
      parent: "id#ln_8f362686",
    },
    "id#ln_4880b8cc": {
      object: "id#df_c841e57b",
    },
    "id#ln_49cef51b": {
      object: "id#df_ee071fff",
    },
    "id#ln_4aab0e8a": {
      args: ["user_fav_book_visited"],
      object: "id#df_3ffc1e9f",
      parent: "id#ln_e9443c67",
    },
    "id#ln_4ac9eb44": {
      args: [["id#ln_8db73e6d", "id#ln_2d18c1ce"]],
      object: "id#df_de705fa4",
    },
    "id#ln_4b1e8621": {
      object: "id#df_be5115db",
    },
    "id#ln_4eb7f81b": {
      object: "id#df_2e747aec",
    },
    "id#ln_4ef5e65b": {
      args: [["id#df_83c127fe", "id#df_ff6ba6b7"]],
      object: "id#df_a3de4295",
      parent: "id#ln_e8ee330e",
    },
    "id#ln_4f8447ee": {
      args: ["id#df_6b69a7aa", "id#df_9d932715"],
      object: "id#df_0c163d47",
    },
    "id#ln_4f9b8d3b": {
      args: [["id#ln_247a9d29", "id#df_2fda9a7f"]],
      object: "id#df_de705fa4",
    },
    "id#ln_4fc53a91": {
      args: ["id#df_4d6a9580"],
      object: "id#df_793930dc",
      parent: "id#ln_8db73e6d",
    },
    "id#ln_51ea07bc": {
      args: ["id#df_4d6a9580"],
      object: "id#df_793930dc",
      parent: "id#ln_e9443c67",
    },
    "id#ln_57495fd6": {
      args: ["id#df_4d6a9580"],
      object: "id#df_793930dc",
      parent: "id#ln_41491750",
    },
    "id#ln_57948307": {
      args: ["id#df_9f643020"],
      object: "id#df_ebed75bb",
    },
    "id#ln_5818036c": {
      args: ["cur_book_ago"],
      object: "id#df_69d4aba1",
      parent: "id#ln_f22710f5",
    },
    "id#ln_59ea8c29": {
      kwargs: {
        initial: ["{fav_book_init} "],
        phrases: ["id#df_67be0739"],
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_5ad89387": {
      object: "id#df_8dde18b5",
    },
    "id#ln_5c4410aa": {
      args: ["id#df_64bd22df"],
      object: "id#df_ebed75bb",
    },
    "id#ln_5c70161c": {
      object: "id#df_b02c36ab",
    },
    "id#ln_5d1bda05": {
      args: ["id#df_4d6a9580"],
      object: "id#df_793930dc",
      parent: "id#ln_0269d896",
    },
    "id#ln_60acf450": {
      object: "id#df_a9d3c742",
    },
    "id#ln_62688b9a": {
      args: ["cur_book_ago"],
      object: "id#df_69d4aba1",
      parent: "id#ln_9285ca9a",
    },
    "id#ln_646eafe1": {
      kwargs: {
        initial: ["{cur_book_about} "],
        phrases: ["id#df_49b207f7"],
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_65c7998a": {
      object: "id#df_8dde18b5",
    },
    "id#ln_675d3989": {
      object: "id#df_8dde18b5",
    },
    "id#ln_6886ac13": {
      object: "id#df_9f9b904b",
    },
    "id#ln_6a60cef1": {
      args: [["cur_genre", "id#ln_c1e72cc9"]],
      object: "id#df_d8f41dc8",
    },
    "id#ln_6e59d3bc": {
      object: "id#df_8dde18b5",
    },
    "id#ln_6fb74c6e": {
      object: "id#df_54fb4274",
    },
    "id#ln_706450e0": {
      args: [["id#df_67be0739", "id#df_4c6fa153"]],
      object: "id#df_793930dc",
      parent: "id#ln_ca98e714",
    },
    "id#ln_7329d2f9": {
      args: ["id#df_2cf88443"],
      object: "id#df_b439d4a6",
      parent: "id#ln_ceaf327a",
    },
    "id#ln_740c5d92": {
      object: "id#df_9f9b904b",
    },
    "id#ln_744d8c1f": {
      object: "id#df_8dde18b5",
    },
    "id#ln_749745a9": {
      args: ["negative"],
      object: "id#df_3bba08f3",
    },
    "id#ln_74f3515e": {
      object: "id#df_8dde18b5",
    },
    "id#ln_761060ae": {
      args: ["id#df_49b207f7"],
      object: "id#df_793930dc",
      parent: "id#ln_05244583",
    },
    "id#ln_77ed8239": {
      args: ["id#df_2cf88443"],
      object: "id#df_b439d4a6",
      parent: "id#ln_41491750",
    },
    "id#ln_78845d57": {
      kwargs: {
        initial: ["I believe that {cur_book_name} is {cur_genre}. "],
      },
      object: "id#df_daefec02",
    },
    "id#ln_7b0a597b": {
      object: "id#df_2e36c7c9",
    },
    "id#ln_7b871131": {
      args: ["book_skill_active"],
      object: "id#df_911e77d5",
    },
    "id#ln_7bd4cf14": {
      args: ["book_skill_active", "id#df_595fb614"],
      object: "id#df_911e77d5",
    },
    "id#ln_7c02923f": {
      object: "id#df_8dde18b5",
    },
    "id#ln_7cfd6cd5": {
      args: [
        {
          kwarg_name: "initial",
          output: "",
        },
      ],
      kwargs: {
        phrases: "id#df_bdc087c1",
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_7ee2ed81": {
      args: ["id#df_2cf88443"],
      object: "id#df_b439d4a6",
      parent: "id#ln_9d9af697",
    },
    "id#ln_806650d4": {
      object: "id#df_2e747aec",
    },
    "id#ln_806d35ab": {
      object: "id#df_c841e57b",
    },
    "id#ln_80dd226a": {
      args: ["id#df_4d6a9580"],
      object: "id#df_793930dc",
      parent: "id#ln_9d9af697",
    },
    "id#ln_813f7495": {
      kwargs: {
        initial: [
          "Unfortunately, as a socialbot, I don't have an immortal soul, so I don't think I will ever go to Heaven. That's why I don't know much about religion. Apart from the Bible, ",
        ],
        phrases: "id#df_6759989a",
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_83b6d38d": {
      kwargs: {
        initial: ["I see you love it.It is so wonderful that you read the books you love. "],
      },
      object: "id#df_daefec02",
    },
    "id#ln_84090d8a": {
      args: ["id#df_e0fe8b97"],
      object: "id#df_83933489",
      parent: "id#ln_c1e72cc9",
    },
    "id#ln_84437ee6": {
      object: "id#df_8dde18b5",
    },
    "id#ln_85807bef": {
      args: ["id#df_4d6a9580"],
      object: "id#df_793930dc",
      parent: "id#ln_aa49e967",
    },
    "id#ln_85a06fa4": {
      kwargs: {
        initial: ["{cur_book_about} "],
        phrases: ["id#df_4c6fa153"],
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_8aea542d": {
      kwargs: {
        initial: ["{cur_book_about} Anyway, "],
      },
      object: "id#df_daefec02",
    },
    "id#ln_8d2ebaa8": {
      object: "id#df_2fda9a7f",
    },
    "id#ln_8db73e6d": {
      args: [["id#ln_4fc53a91", "id#df_d5978396"]],
      object: "id#df_a3de4295",
      parent: "id#ln_4ac9eb44",
    },
    "id#ln_8f1928aa": {
      args: ["id#df_360f1ec0"],
      object: "id#df_b439d4a6",
      parent: "id#ln_41491750",
    },
    "id#ln_8f362686": {
      args: [["id#ln_487a17a9", "id#ln_aa7e62fc", "id#df_0ff0745c"]],
      object: "id#df_de705fa4",
    },
    "id#ln_911de500": {
      kwargs: {
        initial: ["Fabulous! And "],
        phrases: ["id#df_39f25960"],
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_912e4e81": {
      args: [["id#ln_419b2ae0", "id#df_5d69e262"]],
      object: "id#df_de705fa4",
    },
    "id#ln_91d2e7fb": {
      args: ["bible_start_visited"],
      object: "id#df_3ffc1e9f",
      parent: "id#ln_23257c1a",
    },
    "id#ln_9285ca9a": {
      args: [["id#df_b1a3343d", "id#ln_62688b9a"]],
      object: "id#df_de705fa4",
    },
    "id#ln_93c17f4b": {
      object: "id#df_2fda9a7f",
    },
    "id#ln_943a372b": {
      args: ["id#df_edfe4e11"],
      object: "id#df_793930dc",
      parent: "id#ln_b04e6ee5",
    },
    "id#ln_94fd5995": {
      object: "id#df_bbad0776",
    },
    "id#ln_9772576a": {
      object: "id#df_c841e57b",
    },
    "id#ln_97d01f56": {
      object: "id#df_8dde18b5",
    },
    "id#ln_99e39b48": {
      kwargs: {
        initial: ["{cur_book_author} is a wonderful writer! By the way, "],
      },
      object: "id#df_daefec02",
    },
    "id#ln_9a154c9f": {
      object: "id#df_c841e57b",
    },
    "id#ln_9b1fcb61": {
      args: ["id#df_407f54ee"],
      object: "id#df_d195bc92",
    },
    "id#ln_9b25a0b2": {
      object: "id#df_9dc061f8",
    },
    "id#ln_9c1273ea": {
      object: "id#df_fe37e20b",
    },
    "id#ln_9c42ec92": {
      object: "id#df_9f9b904b",
    },
    "id#ln_9d9af697": {
      args: [["id#ln_80dd226a", "id#df_0ff0745c", "id#ln_7ee2ed81"]],
      object: "id#df_de705fa4",
    },
    "id#ln_9dbc53a9": {
      args: [["id#df_b1a3343d", "id#df_2099bac2"]],
      object: "id#df_a3de4295",
      parent: "id#ln_ceaf327a",
    },
    "id#ln_9dda33a2": {
      object: "id#df_b02c36ab",
    },
    "id#ln_9e7dd848": {
      object: "id#df_2e747aec",
    },
    "id#ln_a31dd73e": {
      object: "id#df_8dde18b5",
    },
    "id#ln_a35f3230": {
      args: ["positive"],
      object: "id#df_3bba08f3",
    },
    "id#ln_a45eac42": {
      args: ["id#df_3dd97b5d"],
      object: "id#df_ebed75bb",
    },
    "id#ln_a6cd3c3e": {
      kwargs: {
        initial: ['random.choice(loc_rsp.READ_BOOK_ADVICES) + " "'],
        phrases: ["id#df_67be0739"],
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_a854d778": {
      kwargs: {
        initial: ["{cur_book_ago}ago! "],
        phrases: "id#df_d499fe17",
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_a8e1e50e": {
      kwargs: {
        initial: ["Anyway, let's talk about something else! "],
        phrases: ["id#df_c92c693b", "id#df_b11ea92e", "What's on your mind?"],
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_aa49e967": {
      args: [["id#ln_85807bef", "id#df_d5978396"]],
      object: "id#df_a3de4295",
      parent: "id#ln_ceaf327a",
    },
    "id#ln_aa7e62fc": {
      args: ["id#df_5d69e262"],
      object: "id#df_b439d4a6",
      parent: "id#ln_8f362686",
    },
    "id#ln_b04e6ee5": {
      args: [["id#ln_943a372b", "id#df_2ef28b51"]],
      object: "id#df_a3de4295",
    },
    "id#ln_b1cd035b": {
      args: ["user_fav_genre_visited", "id#df_595fb614"],
      object: "id#df_911e77d5",
    },
    "id#ln_b29626df": {
      object: "id#df_9f9b904b",
    },
    "id#ln_b5d6794f": {
      object: "id#df_8dde18b5",
    },
    "id#ln_b6f8025c": {
      args: [["id#ln_e5ca56b9", "id#df_2fda9a7f"]],
      object: "id#df_de705fa4",
    },
    "id#ln_b707caf1": {
      args: [["id#df_7e323cc4", "id#df_ccd0da85"]],
      object: "id#df_a3de4295",
      parent: "id#ln_ea1c0535",
    },
    "id#ln_b85d4e73": {
      args: [["id#ln_2255fac5", "id#df_ff6ba6b7"]],
      object: "id#df_de705fa4",
    },
    "id#ln_b966ca2a": {
      args: [["id#ln_ca98e714", "id#ln_bad7651e"]],
      object: "id#df_de705fa4",
    },
    "id#ln_baaadb61": {
      object: "id#df_2e747aec",
    },
    "id#ln_bad7651e": {
      args: [["id#df_8db0aab5", "id#df_0d5ebfa6"]],
      object: "id#df_a3de4295",
      parent: "id#ln_b966ca2a",
    },
    "id#ln_bb353192": {
      args: ["id#df_dd8c9daa"],
      object: "id#df_b439d4a6",
      parent: "id#ln_ceaf327a",
    },
    "id#ln_bc4e30fb": {
      args: ["id#ln_f18d8b57"],
      object: "id#df_b439d4a6",
      parent: "id#ln_2c410f56",
    },
    "id#ln_bd573468": {
      kwargs: {
        initial: ["I've read it. It's an amazing book! "],
        phrases: ["id#df_49b207f7"],
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_bda3ab55": {
      object: "id#df_eb39287e",
    },
    "id#ln_bf4aea8e": {
      object: "id#df_2fda9a7f",
    },
    "id#ln_c1e72cc9": {
      args: ["id#ln_84090d8a"],
      object: "id#df_8473ea62",
      parent: "id#ln_6a60cef1",
    },
    "id#ln_c4fa438e": {
      object: "id#df_8dde18b5",
    },
    "id#ln_c60c109f": {
      object: "id#df_fda5ab12",
    },
    "id#ln_ca98e714": {
      args: [["id#ln_706450e0", "id#df_46dfc204"]],
      object: "id#df_a3de4295",
      parent: "id#ln_b966ca2a",
    },
    "id#ln_ccc049bf": {
      kwargs: {
        initial: [
          "Strange, I've never heard about this author. I'll surely check out his works sometime. ",
        ],
      },
      object: "id#df_daefec02",
    },
    "id#ln_cd7284cc": {
      object: "id#df_9f9b904b",
    },
    "id#ln_ce0fb448": {
      object: "id#df_2fda9a7f",
    },
    "id#ln_ceaf327a": {
      args: [
        ["id#ln_aa49e967", "id#ln_9dbc53a9", "id#ln_bb353192", "id#ln_7329d2f9", "id#ln_d89a16a3"],
      ],
      object: "id#df_de705fa4",
    },
    "id#ln_d020edd3": {
      object: "id#df_8dde18b5",
    },
    "id#ln_d257dbb5": {
      args: ["id#df_be32d175"],
      object: "id#df_d195bc92",
    },
    "id#ln_d31e53e3": {
      object: "id#df_2e747aec",
    },
    "id#ln_d399470d": {
      kwargs: {
        initial: ["That's great. Outside of a dog, a book is man's best friend. "],
        phrases: ["id#df_a98a3d21"],
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_d4d491d5": {
      object: "id#df_6d465c6c",
    },
    "id#ln_d581a356": {
      object: "id#df_c841e57b",
    },
    "id#ln_d74098fc": {
      args: ["user_fav_book_visited", "id#df_595fb614"],
      object: "id#df_911e77d5",
    },
    "id#ln_d89a16a3": {
      args: ["id#df_360f1ec0"],
      object: "id#df_b439d4a6",
      parent: "id#ln_ceaf327a",
    },
    "id#ln_d932db55": {
      args: ["cur_book_plain"],
      object: "id#df_69d4aba1",
    },
    "id#ln_da9c023f": {
      object: "id#df_8dde18b5",
    },
    "id#ln_db2a4fa9": {
      object: "id#df_8dde18b5",
    },
    "id#ln_dbd5ab26": {
      object: "id#df_c841e57b",
    },
    "id#ln_de742eb7": {
      object: "id#df_1c699bc1",
    },
    "id#ln_dea8ffed": {
      object: "id#df_2e747aec",
    },
    "id#ln_ded0a8b2": {
      object: "id#df_8dde18b5",
    },
    "id#ln_e0f9e342": {
      object: "id#df_8a05f783",
    },
    "id#ln_e13e2da6": {
      object: "id#df_b1a3343d",
    },
    "id#ln_e20e30d3": {
      args: ["id#df_dd8c9daa"],
      object: "id#df_b439d4a6",
      parent: "id#ln_41491750",
    },
    "id#ln_e5ca56b9": {
      args: ["id#df_edfe4e11"],
      object: "id#df_793930dc",
      parent: "id#ln_b6f8025c",
    },
    "id#ln_e7895b9c": {
      kwargs: {
        initial: [
          "You have a great taste in books! I also adore books by {cur_book_author}, especially {cur_author_best}. ",
        ],
        phrases: "id#df_e48ca201",
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_e8ee330e": {
      args: [["id#ln_05244583", "id#ln_4ef5e65b"]],
      object: "id#df_de705fa4",
    },
    "id#ln_e9443c67": {
      args: [["id#ln_0b7baa69", "id#ln_4aab0e8a", "id#ln_51ea07bc"]],
      object: "id#df_de705fa4",
    },
    "id#ln_ea1c0535": {
      args: [["id#ln_b707caf1", "id#df_39127241"]],
      object: "id#df_de705fa4",
    },
    "id#ln_eb895ea3": {
      args: ["id#df_9f643020"],
      object: "id#df_ebed75bb",
    },
    "id#ln_ec2ebeca": {
      kwargs: {
        exit_on_exhaust: "id#df_595fb614",
        initial: ["Speaking of books, "],
        phrases: "id#df_6759989a",
      },
      object: "id#df_4bcdc76c",
    },
    "id#ln_ed8511b3": {
      object: "id#df_c841e57b",
    },
    "id#ln_edd4caed": {
      args: ["", ["id#df_90c08b14"]],
      object: "id#df_4bcdc76c",
    },
    "id#ln_ee59480b": {
      args: ["id#ln_32d32a8b"],
      object: "id#df_b439d4a6",
      parent: "id#ln_ff52dfb4",
    },
    "id#ln_f18d8b57": {
      args: ["bible_start_visited"],
      object: "id#df_3ffc1e9f",
      parent: "id#ln_bc4e30fb",
    },
    "id#ln_f2207686": {
      object: "id#df_c841e57b",
    },
    "id#ln_f22710f5": {
      args: [["id#df_b1a3343d", "id#ln_5818036c"]],
      object: "id#df_de705fa4",
    },
    "id#ln_f53238e7": {
      object: "id#df_c9fa287f",
    },
    "id#ln_f9bc8e01": {
      object: "id#df_2fda9a7f",
    },
    "id#ln_ff52dfb4": {
      args: [["id#df_c42d49e3", "id#ln_ee59480b", "id#ln_214a2d84"]],
      object: "id#df_de705fa4",
    },
  },
  miscs: {},
  nodes: {
    "id#nd_00c836ac": {
      name: "told_why",
      response: "id#rs_41a9bf98",
      transitions: ["id#tr_336a80dd"],
      type: "regular",
    },
    "id#nd_0f8b2ea5": {
      name: "bot_fav",
      processing: "id#pr_51b93b29",
      response: "id#rs_4b9ab3cc",
      type: "regular",
    },
    "id#nd_2126aa4a": {
      name: "offer_best",
      processing: "id#pr_502da820",
      response: "id#rs_9500bd79",
      type: "regular",
    },
    "id#nd_2658e2ec": {
      name: "user_disliked",
      processing: "id#pr_2c128a11",
      response: "id#rs_c5795d0f",
      type: "regular",
    },
    "id#nd_266d1745": {
      name: "fav_elaborate",
      processing: "id#pr_e7be98ba",
      response: "id#rs_7914ecc6",
      transitions: ["id#tr_217c7b23"],
      type: "regular",
    },
    "id#nd_2b8abc07": {
      name: "return_genrebook",
      processing: "id#pr_7e5028c2",
      response: "id#rs_7778146f",
      type: "regular",
    },
    "id#nd_2d3427a5": {
      name: "not_read_genrebook",
      processing: "id#pr_d55e5387",
      response: "id#rs_bd1d4ad4",
      transitions: ["id#tr_6a940a73"],
      type: "regular",
    },
    "id#nd_322a8f8f": {
      name: "ask_fav",
      processing: "id#pr_8dcc6e7b",
      response: "id#rs_83f9b601",
      transitions: ["id#tr_2f439c71"],
      type: "regular",
    },
    "id#nd_379cc2b8": {
      name: "tell_movie",
      processing: "id#pr_fd182e15",
      response: "id#rs_c3eb692b",
      type: "regular",
    },
    "id#nd_39a26437": {
      name: "user_fav",
      processing: "id#pr_d9b6ddf9",
      response: "id#rs_d19f7d5f",
      transitions: ["id#tr_39687d4d"],
      type: "regular",
    },
    "id#nd_494d703b": {
      name: "ask_question",
      response: "id#rs_2a670644",
      type: "regular",
    },
    "id#nd_4dbe14fc": {
      name: "denied_information",
      response: "id#rs_93ba7c70",
      transitions: ["id#tr_074c32ab"],
      type: "regular",
    },
    "id#nd_4ffdd28c": {
      name: "book_restart",
      processing: "id#pr_6f337169",
      response: "id#rs_9992a575",
      transitions: ["id#tr_f342d423"],
      type: "regular",
    },
    "id#nd_5a6cbfe3": {
      name: "tell_phrase",
      processing: "id#pr_c54dd0e9",
      response: "id#rs_97fa4306",
      transitions: ["id#tr_2d476dd2"],
      type: "regular",
    },
    "id#nd_5bbd1d11": {
      name: "offer_fact",
      processing: "id#pr_ea229d5c",
      response: "id#rs_60fc7a5c",
      transitions: ["id#tr_09c83b32"],
      type: "regular",
    },
    "id#nd_6030c06a": {
      name: "offer_date",
      processing: "id#pr_fbe031df",
      response: "id#rs_4ff8dc6e",
      transitions: ["id#tr_651217b7", "id#tr_839f81ea", "id#tr_37292e91"],
      type: "regular",
    },
    "id#nd_654a2c67": {
      name: "change_branch",
      response: "id#rs_d640d127",
      type: "regular",
    },
    "id#nd_68facd34": {
      transitions: [
        "id#tr_096cd83b",
        "id#tr_cbb3bcfb",
        "id#tr_d04d525c",
        "id#tr_e0701107",
        "id#tr_a412ef27",
        "id#tr_6011bd66",
        "id#tr_4afde2e3",
        "id#tr_5e989f17",
        "id#tr_ae3fa0fc",
        "id#tr_01f87543",
        "id#tr_3ad26ab0",
        "id#tr_1b2c8419",
        "id#tr_17a88233",
        "id#tr_b28807d1",
        "id#tr_9ab5cbc7",
        "id#tr_0c470863",
        "id#tr_afd74c8a",
        "id#tr_adc80518",
        "id#tr_c3b19985",
        "id#tr_87d13afb",
        "id#tr_3a75cbe9",
        "id#tr_c4948320",
        "id#tr_52d4e4a3",
      ],
      type: "global",
    },
    "id#nd_6ee48e8f": {
      name: "fallback",
      processing: "id#pr_7adf725c",
      response: "id#rs_89f41bec",
      type: "regular",
    },
    "id#nd_7b39976f": {
      name: "dislikes_reading",
      response: "id#rs_cd1edeb0",
      transitions: ["id#tr_529fc025"],
      type: "regular",
    },
    "id#nd_7b4e9517": {
      name: "fav_name",
      processing: "id#pr_03300334",
      response: "id#rs_51a83794",
      transitions: ["id#tr_02649e9a"],
      type: "regular",
    },
    "id#nd_83295d8d": {
      name: "ask_to_repeat",
      response: "id#rs_9b037c35",
      type: "regular",
    },
    "id#nd_961044f9": {
      name: "start",
      processing: "id#pr_7cc88551",
      response: "id#rs_bf8b96a7",
      transitions: ["id#tr_a6757318", "id#tr_5425fe0b"],
      type: "regular",
    },
    "id#nd_9ab82bd1": {
      name: "bible_start",
      response: "id#rs_93c29c9e",
      transitions: ["id#tr_8cfa160e"],
      type: "regular",
    },
    "id#nd_9f68c5ea": {
      name: "tell_date",
      processing: "id#pr_44dd4d9a",
      response: "id#rs_3fc66646",
      transitions: ["id#tr_5ed365a7", "id#tr_84186787"],
      type: "regular",
    },
    "id#nd_a6f80f2b": {
      name: "user_liked",
      processing: "id#pr_71b18da3",
      response: "id#rs_560e6cb4",
      transitions: ["id#tr_27b51eba", "id#tr_af57e1d7"],
      type: "regular",
    },
    "id#nd_a7399602": {
      name: "tell_about",
      processing: "id#pr_adaa1a4e",
      response: "id#rs_7e38066e",
      transitions: ["id#tr_086f0898", "id#tr_2fb3682a", "id#tr_fa207c57"],
      type: "regular",
    },
    "id#nd_ab019aae": {
      name: "unrecognized_author",
      response: "id#rs_65758735",
      type: "regular",
    },
    "id#nd_abd5779b": {
      name: "book_start",
      processing: "id#pr_a74c39e5",
      response: "id#rs_9804966e",
      transitions: ["id#tr_76b4f6f8", "id#tr_0262ade8"],
      type: "regular",
    },
    "id#nd_ac96df56": {
      name: "genrebook_info",
      processing: "id#pr_70ee4160",
      response: "id#rs_da62be4b",
      type: "regular",
    },
    "id#nd_aea9a2cb": {
      name: "no_book_author",
      processing: "id#pr_4998cb4f",
      response: "id#rs_c058ac9e",
      type: "regular",
    },
    "id#nd_b8cafe88": {
      name: "bible_elaborate",
      response: "id#rs_12225fa7",
      transitions: ["id#tr_15391295"],
      type: "regular",
    },
    "id#nd_c77759d2": {
      name: "tell_genre",
      processing: "id#pr_fcd06622",
      response: "id#rs_c4bfb916",
      transitions: ["id#tr_bf1831ee", "id#tr_daf99e15"],
      type: "regular",
    },
    "id#nd_d7aace1e": {
      name: "cannot_name",
      response: "id#rs_cdf083f0",
      type: "regular",
    },
    "id#nd_daa6d96f": {
      name: "offer_genre",
      processing: "id#pr_94ba0d6e",
      response: "id#rs_65398332",
      transitions: ["id#tr_00847616"],
      type: "regular",
    },
    "id#nd_e27824ff": {
      name: "fav_denied",
      processing: "id#pr_715c5f69",
      response: "id#rs_199906b9",
      transitions: ["id#tr_e58eb19d"],
      type: "regular",
    },
    "id#nd_f29b0b57": {
      name: "likes_reading",
      response: "id#rs_3fd91f27",
      transitions: ["id#tr_7edb2ef0"],
      type: "regular",
    },
    "id#nd_f52b12ac": {
      name: "ask_opinion",
      response: "id#rs_09288b32",
      transitions: ["id#tr_96ccf940", "id#tr_9de1b44a"],
      type: "regular",
    },
  },
  plots: {
    "id#pl_0a05240d": {
      flows: [
        "id#fl_6cb484f8",
        "id#fl_4386d252",
        "id#fl_3531611f",
        "id#fl_1772314a",
        "id#fl_5de7c201",
        "id#fl_7b12037e",
        "id#fl_5f304492",
      ],
      name: "flows",
    },
  },
  processings: {
    "id#pr_03300334": {
      items: [
        {
          '"save_next_key"': "id#ln_4f8447ee",
        },
        {
          '"execute_response"': "id#ln_806650d4",
        },
        {
          '"fill_responses_by_slots"': "id#ln_9772576a",
        },
      ],
    },
    "id#pr_2c128a11": {
      items: [
        {
          '"set_confidence"': "id#ln_eb895ea3",
        },
      ],
    },
    "id#pr_44dd4d9a": {
      items: [
        {
          '"get_book_year"': "id#ln_29038625",
        },
        {
          '"execute_response"': "id#ln_9e7dd848",
        },
        {
          '"fill_responses_by_slots"': "id#ln_d581a356",
        },
      ],
    },
    "id#pr_4998cb4f": {
      items: [
        {
          '"get_author_regexp"': "id#ln_9b25a0b2",
        },
        {
          '"execute_response"': "id#ln_baaadb61",
        },
        {
          '"fill_responses_by_slots"': "id#ln_9a154c9f",
        },
      ],
    },
    "id#pr_502da820": {
      items: [
        {
          '"get_book"': "id#ln_cd7284cc",
        },
        {
          '"get_author"': "id#ln_94fd5995",
        },
        {
          '"get_book_by_author"': "id#ln_e0f9e342",
        },
        {
          '"execute_response"': "id#ln_02e0fa83",
        },
        {
          '"fill_responses_by_slots"': "id#ln_dbd5ab26",
        },
      ],
    },
    "id#pr_51b93b29": {
      items: [
        {
          '"save_slots_to_ctx"': "id#ln_6a60cef1",
        },
      ],
    },
    "id#pr_6f337169": {
      items: [
        {
          '"set_confidence"': "id#ln_5c4410aa",
        },
        {
          '"set_flag"': "id#ln_7bd4cf14",
        },
        {
          '"set_can_continue"': "id#ln_9b1fcb61",
        },
      ],
    },
    "id#pr_70ee4160": {
      items: [
        {
          '"about_bookreads"': "id#ln_124de46b",
        },
        {
          '"execute_response"': "id#ln_d31e53e3",
        },
        {
          '"fill_responses_by_slots"': "id#ln_3013bcab",
        },
      ],
    },
    "id#pr_715c5f69": {
      items: [
        {
          '"set_flag"': "id#ln_348fc1c6",
        },
        {
          '"set_confidence"': "id#ln_a45eac42",
        },
      ],
    },
    "id#pr_71b18da3": {
      items: [
        {
          '"set_confidence"': "id#ln_57948307",
        },
      ],
    },
    "id#pr_7adf725c": {
      items: [
        {
          '"set_flag"': "id#ln_7b871131",
        },
        {
          '"set_confidence"': "id#ln_1bac4a59",
        },
        {
          '"set_can_continue"': "id#ln_3b06f6a5",
        },
      ],
    },
    "id#pr_7cc88551": {
      items: [
        {
          '"set_can_continue"': "id#ln_348ee896",
        },
      ],
    },
    "id#pr_7e5028c2": {
      items: [
        {
          '"get_genre_regexp"': "id#ln_0deca063",
        },
        {
          '"get_book_by_genre"': "id#ln_7b0a597b",
        },
        {
          '"fill_responses_by_slots"': "id#ln_4880b8cc",
        },
      ],
    },
    "id#pr_8dcc6e7b": {
      items: [
        {
          '"set_flag"': "id#ln_0abf51a6",
        },
        {
          '"execute_response"': "id#ln_dea8ffed",
        },
      ],
    },
    "id#pr_94ba0d6e": {
      items: [
        {
          '"get_book"': "id#ln_6886ac13",
        },
        {
          '"get_book_genre"': "id#ln_de742eb7",
        },
      ],
    },
    "id#pr_a74c39e5": {
      items: [
        {
          '"set_confidence"': "id#ln_4270b69a",
        },
        {
          '"set_flag"': "id#ln_33f97879",
        },
        {
          '"execute_response"': "id#ln_323d576d",
        },
      ],
    },
    "id#pr_adaa1a4e": {
      items: [
        {
          '"get_book_year"': "id#ln_2b729925",
        },
        {
          '"execute_response"': "id#ln_4eb7f81b",
        },
        {
          '"fill_responses_by_slots"': "id#ln_f2207686",
        },
      ],
    },
    "id#pr_c54dd0e9": {
      items: [
        {
          '"set_flag"': "id#ln_b1cd035b",
        },
        {
          '"get_genre_regexp"': "id#ln_49cef51b",
        },
        {
          '"set_can_continue"': "id#ln_d257dbb5",
        },
      ],
    },
    "id#pr_d55e5387": {
      items: [
        {
          '"execute_response"': "id#ln_30645bd8",
        },
      ],
    },
    "id#pr_d9b6ddf9": {
      items: [
        {
          '"get_book"': "id#ln_9c42ec92",
        },
        {
          '"set_flag"': "id#ln_d74098fc",
        },
      ],
    },
    "id#pr_e7be98ba": {
      items: [
        {
          '"execute_response"': "id#ln_049b7533",
        },
        {
          '"fill_responses_by_slots"': "id#ln_27e19b5c",
        },
      ],
    },
    "id#pr_ea229d5c": {
      items: [
        {
          '"get_book"': "id#ln_b29626df",
        },
        {
          '"about_bookreads"': "id#ln_2801c2a4",
        },
        {
          '"about_wiki"': "id#ln_1e11d65f",
        },
        {
          '"get_movie"': "id#ln_d4d491d5",
        },
      ],
    },
    "id#pr_fbe031df": {
      items: [
        {
          '"get_book"': "id#ln_740c5d92",
        },
        {
          '"get_book_year"': "id#ln_bda3ab55",
        },
        {
          '"execute_response"': "id#ln_4128875e",
        },
      ],
    },
    "id#pr_fcd06622": {
      items: [
        {
          '"execute_response"': "id#ln_093949bb",
        },
        {
          '"fill_responses_by_slots"': "id#ln_806d35ab",
        },
      ],
    },
    "id#pr_fd182e15": {
      items: [
        {
          '"get_movie"': "id#ln_04dff676",
        },
        {
          '"fill_responses_by_slots"': "id#ln_ed8511b3",
        },
      ],
    },
  },
  py_defs: {
    "id#df_08773025": {
      name: "loc_cnd.check_unused",
    },
    "id#df_0b217e34": {
      name: "loc_cnd.told_fav_book",
    },
    "id#df_0c163d47": {
      name: "loc_prs.save_next_key",
    },
    "id#df_0d5ebfa6": {
      name: "loc_cnd.about_in_request",
    },
    "id#df_0ff0745c": {
      name: "loc_cnd.check_author_regexp",
    },
    "id#df_1441b53b": {
      name: "CAN_NOT_CONTINUE",
    },
    "id#df_1b54e101": {
      name: "loc_prs.about_bookreads",
    },
    "id#df_1c699bc1": {
      name: "loc_prs.get_book_genre",
    },
    "id#df_2099bac2": {
      name: "loc_cnd.no_entities",
    },
    "id#df_2cf88443": {
      name: "loc_cnd.author_in_request",
    },
    "id#df_2e36c7c9": {
      name: "loc_prs.get_book_by_genre",
    },
    "id#df_2e747aec": {
      name: "loc_prs.execute_response",
    },
    "id#df_2ef28b51": {
      name: "loc_cnd.asked_fav_book",
    },
    "id#df_2fda9a7f": {
      name: "int_cnd.is_no_vars",
    },
    "id#df_33f2c6d7": {
      name: "ZERO_CONFIDENCE",
    },
    "id#df_360f1ec0": {
      name: "loc_cnd.movie_in_request",
    },
    "id#df_39127241": {
      name: "loc_cnd.check_genre_regexp",
    },
    "id#df_39f25960": {
      name: "loc_rsp.WHAT_BOOK_IMPRESSED_MOST",
    },
    "id#df_3bba08f3": {
      name: "loc_cnd.sentiment_detected",
    },
    "id#df_3bfa4ca0": {
      name: "loc_cnd.genre_in_request",
    },
    "id#df_3dd97b5d": {
      name: "BIT_LOWER_CONFIDENCE",
    },
    "id#df_3ffc1e9f": {
      name: "loc_cnd.check_flag",
    },
    "id#df_407f54ee": {
      name: "CAN_CONTINUE_SCENARIO",
    },
    "id#df_46dfc204": {
      name: "loc_cnd.asked_book_content",
    },
    "id#df_49b207f7": {
      name: "loc_rsp.WHEN_IT_WAS_PUBLISHED",
    },
    "id#df_4bcdc76c": {
      name: "loc_rsp.append_unused",
    },
    "id#df_4c6fa153": {
      name: "loc_rsp.TELL_REQUEST2",
    },
    "id#df_4d6a9580": {
      name: "loc_rsp.ALL_QUESTIONS_ABOUT_BOOK",
    },
    "id#df_54fb4274": {
      name: "lbl.repeat",
    },
    "id#df_579f085d": {
      name: "loc_prs.about_wiki",
    },
    "id#df_595fb614": {
      name: "True",
    },
    "id#df_5d69e262": {
      name: "loc_cnd.bestbook_in_request",
    },
    "id#df_64bd22df": {
      name: "DEFAULT_CONFIDENCE",
    },
    "id#df_674339c2": {
      name: "loc_cnd.doesnt_know",
    },
    "id#df_6759989a": {
      name: "loc_rsp.QUESTIONS_ABOUT_BOOKS",
    },
    "id#df_67be0739": {
      name: "loc_rsp.TELL_REQUEST",
    },
    "id#df_69d4aba1": {
      name: "loc_cnd.check_slot",
    },
    "id#df_6b69a7aa": {
      name: "fav_keys",
    },
    "id#df_6d465c6c": {
      name: "loc_prs.get_movie",
    },
    "id#df_6dde74f0": {
      name: "loc_cnd.asked_book_date",
    },
    "id#df_793930dc": {
      name: "loc_cnd.is_last_used_phrase",
    },
    "id#df_7ac753d4": {
      name: "loc_cnd.dislikes_reading",
    },
    "id#df_7e323cc4": {
      name: "loc_cnd.told_fav_genre",
    },
    "id#df_83933489": {
      name: "list",
    },
    "id#df_83c127fe": {
      name: "loc_cnd.date_in_slots",
    },
    "id#df_8473ea62": {
      name: "random.choice",
    },
    "id#df_8a05f783": {
      name: "loc_prs.get_book_by_author",
    },
    "id#df_8db0aab5": {
      name: "loc_cnd.about_in_slots",
    },
    "id#df_8dde18b5": {
      name: "cnd.true",
    },
    "id#df_90c08b14": {
      name: "loc_rsp.START_PHRASE",
    },
    "id#df_911e77d5": {
      name: "loc_prs.set_flag",
    },
    "id#df_9d932715": {
      name: "loc_rsp.FAVOURITE_BOOK_ATTRS",
    },
    "id#df_9dc061f8": {
      name: "loc_prs.get_author_regexp",
    },
    "id#df_9f643020": {
      name: "SUPER_CONFIDENCE",
    },
    "id#df_9f9b904b": {
      name: "loc_prs.get_book",
    },
    "id#df_a3de4295": {
      name: "cnd.any",
    },
    "id#df_a98a3d21": {
      name: "loc_rsp.WHAT_BOOK_LAST_READ",
    },
    "id#df_a9d3c742": {
      name: "loc_cnd.genrebook_request_detected",
    },
    "id#df_b02c36ab": {
      name: "loc_rsp.genre_phrase",
    },
    "id#df_b11ea92e": {
      name: "OFFER_TALK_ABOUT_SCIENCE",
    },
    "id#df_b1a3343d": {
      name: "int_cnd.is_yes_vars",
    },
    "id#df_b439d4a6": {
      name: "cnd.neg",
    },
    "id#df_bbad0776": {
      name: "loc_prs.get_author",
    },
    "id#df_bdc087c1": {
      name: "loc_rsp.OPINION_REQUEST_ON_BOOK_PHRASES",
    },
    "id#df_be32d175": {
      name: "MUST_CONTINUE",
    },
    "id#df_be5115db": {
      name: "loc_rsp.ASK_GENRE_OF_BOOK",
    },
    "id#df_c42d49e3": {
      name: "loc_cnd.is_proposed_skill",
    },
    "id#df_c841e57b": {
      name: "int_prs.fill_responses_by_slots",
    },
    "id#df_c92c693b": {
      name: "SWITCH_MOVIE_SKILL_PHRASE",
    },
    "id#df_c9fa287f": {
      name: "loc_cnd.exit_skill",
    },
    "id#df_ccd0da85": {
      name: "loc_cnd.asked_opinion_genre",
    },
    "id#df_d195bc92": {
      name: "int_prs.set_can_continue",
    },
    "id#df_d499fe17": {
      name: "loc_rsp.DID_NOT_EXIST",
    },
    "id#df_d5978396": {
      name: "loc_cnd.about_book",
    },
    "id#df_d8f41dc8": {
      name: "int_prs.save_slots_to_ctx",
    },
    "id#df_daefec02": {
      name: "loc_rsp.append_question",
    },
    "id#df_dd8c9daa": {
      name: "loc_cnd.book_in_request",
    },
    "id#df_de705fa4": {
      name: "cnd.all",
    },
    "id#df_e0fe8b97": {
      name: "loc_rsp.GENRE_PHRASES.keys",
    },
    "id#df_e48ca201": {
      name: "loc_rsp.ASK_ABOUT_OFFERED_BOOK",
    },
    "id#df_eb39287e": {
      name: "loc_prs.get_book_year",
    },
    "id#df_ebed75bb": {
      name: "int_prs.set_confidence",
    },
    "id#df_edfe4e11": {
      name: "loc_rsp.FAVOURITE_BOOK_PHRASES",
    },
    "id#df_ee071fff": {
      name: "loc_prs.get_genre_regexp",
    },
    "id#df_f51c518e": {
      name: "loc_cnd.asked_about_bible",
    },
    "id#df_fda5ab12": {
      name: "loc_cnd.start_condition",
    },
    "id#df_fe37e20b": {
      name: "loc_rsp.BOOK_ANY_PHRASE",
    },
    "id#df_ff6ba6b7": {
      name: "loc_cnd.date_in_request",
    },
  },
  responses: {
    "id#rs_09288b32": {
      response_object: "id#ln_7cfd6cd5",
    },
    "id#rs_12225fa7": {
      response_object: "id#ln_813f7495",
    },
    "id#rs_199906b9": {
      response_object: "OK, let me ask you something else then, alright?",
    },
    "id#rs_2a670644": {
      response_object: "id#ln_19b02f59",
    },
    "id#rs_3fc66646": {
      response_object: "id#ln_a854d778",
    },
    "id#rs_3fd91f27": {
      response_object:
        "I enjoy reading so much! Books help me understand humans much better. Why do you enjoy reading?",
    },
    "id#rs_41a9bf98": {
      response_object: "id#ln_d399470d",
    },
    "id#rs_4b9ab3cc": {
      response_object: "id#ln_5c70161c",
    },
    "id#rs_4ff8dc6e": {
      response_object: "id#ln_bd573468",
    },
    "id#rs_51a83794": {
      response_object: "id#ln_59ea8c29",
    },
    "id#rs_560e6cb4": {
      response_object: "id#ln_83b6d38d",
    },
    "id#rs_60fc7a5c": {
      response_object: '("It\'s an amazing book! " + loc_rsp.OFFER_FACT_ABOUT_BOOK)',
    },
    "id#rs_65398332": {
      response_object: "id#ln_4b1e8621",
    },
    "id#rs_65758735": {
      response_object: "id#ln_ccc049bf",
    },
    "id#rs_7778146f": {
      response_object:
        '("Amazing! I hear, {cur_book_name} is quite good. " + loc_rsp.HAVE_YOU_READ_BOOK)',
    },
    "id#rs_7914ecc6": {
      response_object: "id#ln_85a06fa4",
    },
    "id#rs_7e38066e": {
      response_object: "id#ln_646eafe1",
    },
    "id#rs_83f9b601": {
      response_object: "id#ln_911de500",
    },
    "id#rs_89f41bec": {
      response_object: "id#ln_a8e1e50e",
    },
    "id#rs_93ba7c70": {
      response_object: "id#ln_3c02cde6",
    },
    "id#rs_93c29c9e": {
      response_object:
        "You have good taste in books! By the way, I know that Bible is one of the most widespread books on Earth. It is the foundation stone of Christianity. Have you read the whole Bible?",
    },
    "id#rs_9500bd79": {
      response_object: "id#ln_e7895b9c",
    },
    "id#rs_97fa4306": {
      response_object: "id#ln_9dda33a2",
    },
    "id#rs_9804966e": {
      response_object: "id#ln_edd4caed",
    },
    "id#rs_9992a575": {
      response_object: "id#ln_ec2ebeca",
    },
    "id#rs_9b037c35": {
      response_object:
        "I'm sorry, but I don't know what to say to that yet, but I will definitely learn! Have a nice day, bye!",
    },
    "id#rs_bd1d4ad4": {
      response_object: "id#ln_a6cd3c3e",
    },
    "id#rs_bf8b96a7": {
      response_object: "",
    },
    "id#rs_c058ac9e": {
      response_object: "id#ln_99e39b48",
    },
    "id#rs_c3eb692b": {
      response_object:
        "I enjoyed watching the film {cur_book_movie} based on this book, directed by {cur_book_director}. ",
    },
    "id#rs_c4bfb916": {
      response_object: "id#ln_78845d57",
    },
    "id#rs_c5795d0f": {
      response_object: "id#ln_39ba1b25",
    },
    "id#rs_cd1edeb0": {
      response_object: "Why don't you love reading? Maybe you haven't found the right book?",
    },
    "id#rs_cdf083f0": {
      response_object: "id#ln_9c1273ea",
    },
    "id#rs_d19f7d5f": {
      response_object: "Great choice! Would you like us to discuss it?",
    },
    "id#rs_d640d127": {
      response_object: "id#ln_2927e6ac",
    },
    "id#rs_da62be4b": {
      response_object: "id#ln_8aea542d",
    },
  },
  transitions: {
    "id#tr_00847616": {
      condition: "id#ln_da9c023f",
      label: "id#nd_c77759d2",
    },
    "id#tr_01f87543": {
      condition: "id#ln_60acf450",
      label: "id#nd_2b8abc07",
      priority: 1.2,
    },
    "id#tr_0262ade8": {
      condition: "id#ln_675d3989",
      label: "id#nd_f29b0b57",
    },
    "id#tr_02649e9a": {
      condition: "id#ln_3e794c60",
      label: "id#nd_e27824ff",
    },
    "id#tr_074c32ab": {
      condition: "id#ln_8d2ebaa8",
      label: "id#nd_9ab82bd1",
    },
    "id#tr_086f0898": {
      condition: "id#ln_9285ca9a",
      label: "id#nd_9f68c5ea",
    },
    "id#tr_096cd83b": {
      condition: "id#ln_f53238e7",
      label: "id#nd_6ee48e8f",
      priority: 1.5,
    },
    "id#tr_09c83b32": {
      condition: "id#ln_d020edd3",
      label: "id#nd_654a2c67",
    },
    "id#tr_0c470863": {
      condition: "id#ln_e8ee330e",
      label: "id#nd_9f68c5ea",
      priority: 0.8,
    },
    "id#tr_15391295": {
      condition: "id#ln_7c02923f",
      label: "id#nd_83295d8d",
    },
    "id#tr_17a88233": {
      condition: "id#ln_b966ca2a",
      label: "id#nd_a7399602",
      priority: 1.2,
    },
    "id#tr_1b2c8419": {
      condition: "id#ln_4f9b8d3b",
      label: "id#nd_4dbe14fc",
      priority: 3,
    },
    "id#tr_217c7b23": {
      condition: "id#ln_84437ee6",
      label: "id#nd_6030c06a",
    },
    "id#tr_27b51eba": {
      condition: "id#ln_b5d6794f",
      label: "id#nd_9ab82bd1",
    },
    "id#tr_2d476dd2": {
      condition: "id#ln_93c17f4b",
      label: "id#nd_4dbe14fc",
    },
    "id#tr_2f439c71": {
      condition: "id#ln_74f3515e",
      label: "id#nd_39a26437",
    },
    "id#tr_2fb3682a": {
      condition: "id#ln_2b0e6b93",
      label: "id#nd_4dbe14fc",
    },
    "id#tr_336a80dd": {
      condition: "id#ln_65c7998a",
      label: "id#nd_7b4e9517",
    },
    "id#tr_37292e91": {
      condition: "id#ln_5ad89387",
      label: "id#nd_6ee48e8f",
    },
    "id#tr_39687d4d": {
      condition: "id#ln_c4fa438e",
      label: "id#nd_4dbe14fc",
    },
    "id#tr_3a75cbe9": {
      condition: "id#ln_8f362686",
      label: "id#nd_aea9a2cb",
      priority: 0.8,
    },
    "id#tr_3ad26ab0": {
      condition: "id#ln_3764f81f",
      label: "id#nd_39a26437",
      priority: 0.8,
    },
    "id#tr_4afde2e3": {
      condition: "id#ln_2c410f56",
      label: "id#nd_9ab82bd1",
      priority: 1.8,
    },
    "id#tr_529fc025": {
      condition: "id#ln_a31dd73e",
      label: "id#nd_00c836ac",
    },
    "id#tr_52d4e4a3": {
      condition: "id#ln_ceaf327a",
      label: "id#nd_83295d8d",
      priority: 0.7,
    },
    "id#tr_5425fe0b": {
      condition: "id#ln_0e569491",
      label: "id#ln_6fb74c6e",
    },
    "id#tr_5e989f17": {
      condition: "id#ln_23257c1a",
      label: "id#nd_b8cafe88",
      priority: 1.8,
    },
    "id#tr_5ed365a7": {
      condition: "id#ln_d932db55",
      label: "id#nd_daa6d96f",
    },
    "id#tr_6011bd66": {
      condition: "id#ln_b6f8025c",
      label: "id#nd_e27824ff",
      priority: 2,
    },
    "id#tr_651217b7": {
      condition: "id#ln_f22710f5",
      label: "id#nd_9f68c5ea",
    },
    "id#tr_6a940a73": {
      condition: "id#ln_ce0fb448",
      label: "id#nd_4ffdd28c",
    },
    "id#tr_76b4f6f8": {
      condition: "id#ln_f9bc8e01",
      label: "id#nd_7b39976f",
    },
    "id#tr_7edb2ef0": {
      condition: "id#ln_25fe3532",
      label: "id#nd_00c836ac",
    },
    "id#tr_839f81ea": {
      condition: "id#ln_bf4aea8e",
      label: "id#nd_4dbe14fc",
    },
    "id#tr_84186787": {
      condition: "id#ln_6e59d3bc",
      label: "id#nd_654a2c67",
    },
    "id#tr_87d13afb": {
      condition: "id#ln_9d9af697",
      label: "id#nd_ab019aae",
      priority: 0.8,
    },
    "id#tr_8cfa160e": {
      condition: "id#ln_db2a4fa9",
      label: "id#nd_b8cafe88",
    },
    "id#tr_96ccf940": {
      condition: "id#ln_a35f3230",
      label: "id#nd_a6f80f2b",
    },
    "id#tr_9ab5cbc7": {
      condition: "id#ln_b85d4e73",
      label: "id#nd_6030c06a",
      priority: 1.2,
    },
    "id#tr_9de1b44a": {
      condition: "id#ln_749745a9",
      label: "id#nd_2658e2ec",
    },
    "id#tr_a412ef27": {
      condition: "id#ln_b04e6ee5",
      label: "id#nd_7b4e9517",
      priority: 4,
    },
    "id#tr_a6757318": {
      condition: "id#ln_2a65922e",
      label: "id#nd_abd5779b",
    },
    "id#tr_adc80518": {
      condition: "id#ln_4ac9eb44",
      label: "id#nd_5bbd1d11",
      priority: 1.2,
    },
    "id#tr_ae3fa0fc": {
      condition: "id#ln_ea1c0535",
      label: "id#nd_5a6cbfe3",
      priority: 1,
    },
    "id#tr_af57e1d7": {
      condition: "id#ln_0533745a",
      label: "id#nd_4dbe14fc",
    },
    "id#tr_afd74c8a": {
      condition: "id#ln_0269d896",
      label: "id#nd_daa6d96f",
      priority: 1.2,
    },
    "id#tr_b28807d1": {
      condition: "id#ln_912e4e81",
      label: "id#nd_2126aa4a",
      priority: 1.6,
    },
    "id#tr_bf1831ee": {
      condition: "id#ln_744d8c1f",
      label: "id#nd_9ab82bd1",
    },
    "id#tr_c3b19985": {
      condition: "id#ln_e9443c67",
      label: "id#nd_322a8f8f",
      priority: 0.8,
    },
    "id#tr_c4948320": {
      condition: "id#ln_41491750",
      label: "id#nd_d7aace1e",
      priority: 0.7,
    },
    "id#tr_cbb3bcfb": {
      condition: "id#ln_2996cfdd",
      label: "id#nd_7b39976f",
      priority: 1.5,
    },
    "id#tr_d04d525c": {
      condition: "id#ln_c60c109f",
      label: "id#nd_abd5779b",
    },
    "id#tr_daf99e15": {
      condition: "id#ln_292a9324",
      label: "id#nd_4dbe14fc",
    },
    "id#tr_e0701107": {
      condition: "id#ln_ff52dfb4",
      label: "id#nd_4ffdd28c",
    },
    "id#tr_e58eb19d": {
      condition: "id#ln_e13e2da6",
      label: "id#nd_4ffdd28c",
    },
    "id#tr_f342d423": {
      condition: "id#ln_ded0a8b2",
      label: "id#nd_83295d8d",
    },
    "id#tr_fa207c57": {
      condition: "id#ln_97d01f56",
      label: "id#nd_6ee48e8f",
    },
  },
};

export default plot;
