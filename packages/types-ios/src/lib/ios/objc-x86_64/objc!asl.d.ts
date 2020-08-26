
declare function _asl_evaluate_send(client: interop.Pointer | interop.Reference<any>, msg: interop.Pointer | interop.Reference<any>, level: number): number;

declare function asl_add_log_file(client: interop.Pointer | interop.Reference<any>, descriptor: number): number;

declare function asl_add_output_file(client: interop.Pointer | interop.Reference<any>, fd: number, mfmt: string | interop.Pointer | interop.Reference<any>, tfmt: string | interop.Pointer | interop.Reference<any>, filter: number, text_encoding: number): number;

declare function asl_append(obj: interop.Pointer | interop.Reference<any>, obj_to_add: interop.Pointer | interop.Reference<any>): void;

declare function asl_close(obj: interop.Pointer | interop.Reference<any>): void;

declare function asl_close_auxiliary_file(descriptor: number): number;

declare function asl_count(obj: interop.Pointer | interop.Reference<any>): number;

declare function asl_create_auxiliary_file(msg: interop.Pointer | interop.Reference<any>, title: string | interop.Pointer | interop.Reference<any>, uti: string | interop.Pointer | interop.Reference<any>, out_descriptor: interop.Pointer | interop.Reference<number>): number;

declare function asl_decode_buffer(_in: string | interop.Pointer | interop.Reference<any>, buf: interop.Pointer | interop.Reference<string>, len: interop.Pointer | interop.Reference<number>): number;

declare function asl_encode_buffer(buf: string | interop.Pointer | interop.Reference<any>, len: number): string;

declare function asl_fetch_key_val_op(msg: interop.Pointer | interop.Reference<any>, n: number, key: interop.Pointer | interop.Reference<string>, val: interop.Pointer | interop.Reference<string>, op: interop.Pointer | interop.Reference<number>): number;

declare function asl_format(msg: interop.Pointer | interop.Reference<any>, msg_fmt: string | interop.Pointer | interop.Reference<any>, time_fmt: string | interop.Pointer | interop.Reference<any>, text_encoding: number): string;

declare function asl_free(obj: interop.Pointer | interop.Reference<any>): void;

declare function asl_get(msg: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): string;

declare function asl_get_index(list: interop.Pointer | interop.Reference<any>, index: number): interop.Pointer | interop.Reference<any>;

declare function asl_get_type(obj: interop.Pointer | interop.Reference<any>): number;

declare function asl_key(msg: interop.Pointer | interop.Reference<any>, n: number): string;

declare function asl_log_auxiliary_location(msg: interop.Pointer | interop.Reference<any>, title: string | interop.Pointer | interop.Reference<any>, uti: string | interop.Pointer | interop.Reference<any>, url: string | interop.Pointer | interop.Reference<any>): number;

declare function asl_log_descriptor(asl: interop.Pointer | interop.Reference<any>, msg: interop.Pointer | interop.Reference<any>, level: number, descriptor: number, fd_type: number): number;

declare function asl_match(data: interop.Pointer | interop.Reference<any>, querylist: interop.Pointer | interop.Reference<any>, last: interop.Pointer | interop.Reference<number>, start: number, count: number, duration: number, direction: number): interop.Pointer | interop.Reference<any>;

declare function asl_new(type: number): interop.Pointer | interop.Reference<any>;

declare function asl_next(obj: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function asl_open(ident: string | interop.Pointer | interop.Reference<any>, facility: string | interop.Pointer | interop.Reference<any>, opts: number): interop.Pointer | interop.Reference<any>;

declare function asl_open_from_file(descriptor: number, ident: string | interop.Pointer | interop.Reference<any>, facility: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function asl_open_path(path: string | interop.Pointer | interop.Reference<any>, opts: number): interop.Pointer | interop.Reference<any>;

declare function asl_prepend(obj: interop.Pointer | interop.Reference<any>, obj_to_add: interop.Pointer | interop.Reference<any>): void;

declare function asl_prev(obj: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function asl_release(obj: interop.Pointer | interop.Reference<any>): void;

declare function asl_remove_index(list: interop.Pointer | interop.Reference<any>, index: number): void;

declare function asl_remove_log_file(client: interop.Pointer | interop.Reference<any>, descriptor: number): number;

declare function asl_reset_iteration(obj: interop.Pointer | interop.Reference<any>, position: number): void;

declare function asl_retain(obj: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function asl_search(obj: interop.Pointer | interop.Reference<any>, query: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function asl_send(obj: interop.Pointer | interop.Reference<any>, msg: interop.Pointer | interop.Reference<any>): number;

declare function asl_set(obj: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): number;

declare function asl_set_filter(client: interop.Pointer | interop.Reference<any>, f: number): number;

declare function asl_set_output_file_filter(client: interop.Pointer | interop.Reference<any>, fd: number, filter: number): number;

declare function asl_set_query(msg: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>, op: number): number;

declare function asl_unset(obj: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): number;

declare function aslresponse_free(obj: interop.Pointer | interop.Reference<any>): void;

declare function aslresponse_next(obj: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;
